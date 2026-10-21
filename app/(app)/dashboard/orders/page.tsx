import { ComingSoon } from "@/components/dashboard/ui";
import { requireOwner } from "@/lib/auth";

export default async function OrdersPage() {
  await requireOwner();
  return (
    <ComingSoon title="Orders">
      Jab customer &quot;WhatsApp par Order karein&quot; dabayega, us ka order yahan Pending mein aayega. Aap usay Confirmed,
      Delivered ya Cancelled kar sakenge aur customer ka naam, number, address aur color likh sakenge.
    </ComingSoon>
  );
}
