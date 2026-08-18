import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import {
  TableCard,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/ui/Table.jsx";
import ArticleFormDialog from "../../components/support/ArticleFormDialog.jsx";
import { ARTICLES } from "../../data/support.js";

/**
 * Support > Knowledge Base - Shivalik Admin
 * Figma: FINAL SCREENS / Shivalik Final / Support_ knowledge base
 *   (node 1180:37386)
 *   + Edit article       (1180:37679)
 *   + Add knowledge base (1180:37689)
 *
 * Same shared Table primitives as the ticket screens; the only new piece is
 * ProgressBar for the Helpful column. No stat row, no search and no
 * pagination on this screen - the source has none.
 */
export default function KnowledgeBasePage() {
  // null | { mode: "add" } | { mode: "edit", article }
  const [form, setForm] = useState(null);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Support"
        actions={
          <Button
            variant="primary"
            iconLeading="plus"
            onClick={() => setForm({ mode: "add" })}
          >
            Add knowledge base
          </Button>
        }
      />

      <TableCard>
        <Table>
          <THead>
            <TR>
              <TH width={320}>Title</TH>
              <TH width={140} align="center">Category</TH>
              <TH width={130} align="center">Last Updated</TH>
              <TH width={90} align="center">Views</TH>
              <TH width={280}>Helpful</TH>
              <TH width={180} align="right">Actions</TH>
            </TR>
          </THead>

          <TBody>
            {ARTICLES.map((article) => (
              <TR key={article.id}>
                <TD className="text-primary">{article.title}</TD>
                <TD align="center">
                  <Badge tone="brand">{article.category}</Badge>
                </TD>
                <TD align="center">{article.lastUpdated}</TD>
                <TD align="center" className="tabular font-medium text-primary">
                  {article.views}
                </TD>
                <TD>
                  <ProgressBar value={article.helpful} />
                </TD>
                <TD>
                  <div className="flex items-center justify-end gap-6">
                    <Button
                      variant="link"
                      onClick={() => setForm({ mode: "edit", article })}
                    >
                      Edit
                    </Button>
                    <Button variant="link">Unpublish</Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableCard>

      {/* key remounts the dialog per mode/article so its fields re-seed from
          the row being edited - the PaymentDialog pattern. */}
      <ArticleFormDialog
        key={`${form?.mode}-${form?.article?.id ?? "new"}`}
        mode={form?.mode ?? "add"}
        article={form?.article}
        open={form !== null}
        onClose={() => setForm(null)}
      />
    </div>
  );
}
