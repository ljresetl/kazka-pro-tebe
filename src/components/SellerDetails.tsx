import { SITE } from "@/lib/site";

/** Реквізити продавця. Порожні поля не показуються. */
export default function SellerDetails() {
  const rows = [
    ["Продавець", SITE.sellerName],
    ["РНОКПП / ЄДРПОУ", SITE.sellerCode],
    ["Адреса", SITE.sellerAddress],
    ["Пошта", SITE.email],
    ["Телефон", SITE.phone],
  ].filter(([, v]) => v);

  if (rows.length === 0) {
    return <p className="notice is-info">Реквізити продавця буде опубліковано тут до запуску онлайн-оплати.</p>;
  }
  return (
    <table>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <th scope="row">{k}</th>
            <td>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
