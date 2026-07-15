import { requireChatGPTUser } from "../chatgpt-auth";
import ExamWorkspace from "../exam-lab/exam-workspace";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const user = await requireChatGPTUser("/vault");
  return <ExamWorkspace displayName={user.displayName} isPrivate />;
}
