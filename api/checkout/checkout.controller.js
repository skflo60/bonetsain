const CONFIG = require('../../config/config')
const Stripe = require('stripe');
const Order = require('../order/order.model');
const Shop = require('../shop/shop.model');
const User = require('../user/user.model');
const DELIVERY_COST = 4.9
const sendMail = require('../utils/mail.service')

function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

exports.getSession = async (req, res, next) => {
  const order = req.body;
  const cart = order.cart || [];
  const groupedCart = groupBy(order.cart, 'shop');
  const shops = Object.keys(groupedCart);
  const total_brut = Number(cart.map(c=>c.subtotal).reduce((acc, val) => acc + val).toFixed(2));
  const amount = (total_brut + (order.delivery ? DELIVERY_COST * shops.length : 0))*100;
  const test = shops[0] === '5e1e38a41c9d44000073a0a8';
  (async () => {
    const stripe_key = test ? 'sk_test_WkZb6QtYaD3nzlVSxbIFXXhQ00Txor8IU5' : process.env.stripe_key;
    const stripe = new Stripe(stripe_key);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: order.email,
      line_items: [{
        name: `Commande Local & Frais`,
        description: cart.map(p=>p.name).join(', '),
        images: ['https://localfrais.fr/legumes.jpg'],
        amount,
        currency: 'eur',
        quantity: 1,
      }],
      success_url: `https://localfrais.fr/payment?session_id={CHECKOUT_SESSION_ID}${(test ? '&test=true' : '')}`,
      cancel_url: 'https://localfrais.fr/checkout',
    });
    order.session_id = session.id
    order.state = 'waiting'
    // Create Order by shop
    shops.forEach(async shopKey => {
      order.shop = shopKey
      order.cart = groupedCart[shopKey]
      order.total_ttc = amount / 100;
      const reduction = total_brut * 10 / 100;
      order.total_net = (total_brut - reduction);
      const createdOrder = await Order.create(order);
      order.cart.forEach(async product => {
        // TODO double check product price
        if (product.stock) {
          product.stock=product.stock-1
          await Product.findByIdAndUpdate(product.id, { stock: product.stock });
        }
      });
      const foundShop = await Shop.findOne({ _id: shopKey });
      // Mail for producteur
      sendMail(foundShop.email, groupedCart[shopKey], createdOrder);
      if (order.selectedTime) {
        // Mail for delivery man
        sendMail(order.deliveryEmail, groupedCart[shopKey], createdOrder, null, 'Commande à livrer');
      }
    });
    res.json(session)
  })();
};

exports.verifySession = async (req, res, next) => {
  const stripe_key = process.env.stripe_key;
  const stripe = new Stripe(stripe_key);
  await stripe.checkout.sessions.retrieve(req.params.uid,
    function(err, session) {
      if (session) {
        const stripe = new Stripe(req.query.test ? "sk_test_WkZb6QtYaD3nzlVSxbIFXXhQ00Txor8IU5" : process.env.stripe_key);
        stripe.paymentIntents.retrieve(
          session.payment_intent,
          async function(err, paymentIntent) {
            if (paymentIntent) {
              if (paymentIntent.status === 'succeeded') {
                const customer = await stripe.customers.retrieve(session.customer);
                var result = await Order.update(
                  { session_id: session.id },
                  { state: 'paid', isPaid: true, email: customer.email, name: customer.name },
                  { multi: true });
                };
                // Mail for buyer with order link
                sendMail(order.email, groupedCart[shopKey], result, null, "Votre commande a été validée, vous serez informé 1h avant la livraison");
                res.json(paymentIntent.status)
              } else {
                res.json(err)
              }
            }
          );
        } else {
          res.json(err)
        }
      }
    );
  };
