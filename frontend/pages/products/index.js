import { useRouter } from "next/dist/client/router";
import Pagination from "../../components/Pagination";
import Products from "../../components/Products";

export default function productsPage() {
  const router = useRouter();
  const { page } = router.query;

  return (
    <div>
      <Pagination page={parseInt(page) || 1} />
      <Products page={parseInt(page) || 1} />
      <Pagination page={parseInt(page) || 1} />
    </div>
  );
}
