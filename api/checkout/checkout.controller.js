const CONFIG = require('../../config/config')
const stripe = require('stripe')('sk_test_WkZb6QtYaD3nzlVSxbIFXXhQ00Txor8IU5');
const Order = require('../order/order.model');

function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

exports.getSession = async (req, res, next) => {
  const order = req.body;
  const cart = order.cart || [];
  const amount = Number(cart.map(c=>c.subtotal).reduce((acc, val) => acc + val) + (order.delivery ? 4.9 : 0)) * 100;
  (async () => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: order.email,
      line_items: [{
        name: `Commande Local & Frais`,
        description: cart.map(p=>p.name).join(', '),
        images: cart.map(p=>p.image),
        amount,
        currency: 'eur',
        quantity: 1,
      }],
      success_url: CONFIG.front_url + '/payment?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: CONFIG.front_url + '/payment?session_id=null',
    });
    order.session_id = session.id
    order.state = 'waiting'
    const groupedCart = groupBy(order.cart, 'shop');
    // Create Order by shop
    Object.keys(groupedCart).forEach(async shopKey => {
      order.shop = shopKey
      order.cart = groupedCart[shopKey]
      await Order.create(order)
    });
    res.json(session)
  })();
};

exports.verifySession = async (req, res, next) => {
  await stripe.checkout.sessions.retrieve(req.params.uid,
    function(err, session) {
      if (session) {
        stripe.paymentIntents.retrieve(
          session.payment_intent,
          async function(err, paymentIntent) {
            if (paymentIntent) {
              if (paymentIntent.status === 'succeeded') {
                var result = await Order.update(
                  { session_id: session.id },
                  { state: 'paid', email: session.customer_email },
                  { multi: true });
                };
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
