import { KeystoneContext } from "@keystone-next/types";
import {
  CartItemCreateInput,
  OrderCreateInput,
} from "../.keystone/schema-types";
import stripeConfig from "../lib/stripe";

interface Arguments {
  token: string;
}

const graphql = String.raw;

async function checkout(
  root: any,
  { token }: Arguments,
  context: KeystoneContext
): Promise<OrderCreateInput> {
  //   authenticate user
  const userId = context.session.itemId;
  if (!userId) {
    throw new Error("Sorry! You must be signed in to create an order!");
  }

  //   query current users
  const user = await context.lists.User.findOne({
    where: { id: userId },
    resolveFields: graphql`
        id
        name
        email
        cart {
            id
            quantity
            product {
                name
                price
                description
                id
                photo {
                    id
                    image {
                        id
                        publicUrlTransformed
                    }
                }
            }
        }
    `,
  });
  console.dir(user, { depth: null });

  //   calculate total price for order
  const cartItems = user.cart.filter((cartItem) => cartItem.product);
  const amount = cartItems.reduce(
    (acc: number, cartItem: CartItemCreateInput) =>
      acc + cartItem.quantity * cartItem.product.price,
    0
  );
  console.log({ amount: amount });

  //   creating charge with stripe lib
  const charge = await stripeConfig.paymentIntents
    .create({
      amount,
      currency: "INR",
      confirm: true,
      payment_method: token,
    })
    .catch((err) => {
      console.log(err);
      throw new Error(err.message);
    });
  console.log(charge);

  const orderItems = cartItems.map((cartItem) => {
    const orderItem = {
      name: cartItem.product.name,
      description: cartItem.product.description,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      photo: {
        connect: { id: cartItem.product.photo.id },
      },
    };
    return orderItem;
  });

  // create order and return it
  const order = await context.lists.Order.createOne({
    data: {
      total: charge.amount,
      charge: charge.id,
      items: { create: orderItems },
      user: { connect: { id: userId } },
    },
  });

  // clean up any old cart item
  const cartItemIds = cartItems.map((cartItem) => cartItem.id);
  await context.lists.CartItem.deleteMany({ ids: cartItemIds });

  return order;
}

export default checkout;
