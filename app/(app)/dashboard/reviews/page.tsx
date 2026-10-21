import { ComingSoon } from "@/components/dashboard/ui";
import { requireOwner } from "@/lib/auth";

export default async function ReviewsPage() {
  await requireOwner();
  return (
    <ComingSoon title="Reviews">
      Yahan aap customers ke text reviews aur TikTok video reviews add, hide aur upar neeche kar sakenge.
    </ComingSoon>
  );
}
