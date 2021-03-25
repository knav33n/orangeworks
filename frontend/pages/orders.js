import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import styled from "styled-components";
import DisplayError from "../components/ErrorMessage";
import OrderItemStyles from "../components/styles/OrderItemStyles";
import Link from "next/link";
import Head from "next/head";
import formatMoney from "../lib/formatMoney";

const USERS_ORDER_QUERY = gql`
  query USERS_ORDER_QUERY {
    allOrders {
      id
      charge
      total
      user {
        id
      }
      items {
        id
        name
        description
        price
        quantity
        photo {
          image {
            publicUrlTransformed
          }
        }
      }
    }
  }
`;

const OrderUrl = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  grid-gap: 4rem;
`;

const countItemsInAnOrder = (order) =>
  order.items.reduce((acc, item) => acc + item.quantity, 0);

export default function OrdersPage() {
  const { data, error, loading } = useQuery(USERS_ORDER_QUERY);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <DisplayError error={error} />;
  }

  const { allOrders } = data;

  return (
    <div>
      <Head>
        <title>Your Orders ({allOrders.length})</title>
      </Head>
      <h2>You have {allOrders.length} orders!</h2>
      <OrderUrl>
        {allOrders.map((order) => (
          <OrderItemStyles>
            <Link href={`/order/${order.id}`}>
              <a>
                <div className="order-meta">
                  <p>
                    {countItemsInAnOrder(order)} Item
                    {countItemsInAnOrder(order) === 1 ? "" : "s"}
                  </p>
                  <p>
                    {order.items.length} Product
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                  <p>{formatMoney(order.total)}</p>
                </div>
                <div className="images">
                  {order.items.map((item) => (
                    <img
                      key={`img-${item.id}`}
                      src={item.photo?.image?.publicUrlTransformed}
                      alt={item.name}
                    />
                  ))}
                </div>
              </a>
            </Link>
          </OrderItemStyles>
        ))}
      </OrderUrl>
    </div>
  );
}
