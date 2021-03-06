import SingleProduct from "../../components/SingleProduct";
import { useRouter } from "next/router";

export default function SingleProductPage() {
  const router = useRouter();
  const { id } = router.query;
  return <SingleProduct id={id} />;
}
