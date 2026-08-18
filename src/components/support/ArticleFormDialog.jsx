import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { TextField, SelectField, Textarea } from "../ui/TextField.jsx";
import { ARTICLE_CATEGORIES } from "../../data/support.js";

/**
 * Add / Edit knowledge base article dialog
 * Figma: FINAL SCREENS / Shivalik Final / Group 57/58
 *   (nodes 1180:37679 "Edit article", 1180:37689 "Add knowledge base")
 *
 * One dialog, two modes - same construction as PaymentDialog: the two Figma
 * frames are the same three-field form with a different title and a
 * different starting state, not two different forms.
 *
 * DEVIATIONS FROM FIGMA:
 *  - The "Add knowledge base" frame shows the same prefilled title/category
 *    as "Edit article" (both read "How to record a payment" / "Payment") -
 *    a copy-paste leftover in the file, not an intentional default. Add mode
 *    starts empty here, matching every other Add dialog in the app.
 *  - The body field's label reads "Contect" in Figma; rendered as
 *    "Body (markdown)" - a typo fix, not a wording choice, and the second
 *    field (Category) already establishes the "Body" naming the label
 *    should have matched.
 *
 * STATE: lazy-seeded from `article`, remounted by the parent via
 * `key={mode + article?.id}` rather than an effect - the ClientDetailDialog
 * pattern.
 */

const TITLES = {
  add: "Add knowledge base",
  edit: "Edit article",
};

const EMPTY = { title: "", category: "", body: "" };

export default function ArticleFormDialog({ mode = "add", article, open, onClose, onSave }) {
  const [values, setValues] = useState(() =>
    mode === "edit" && article
      ? { title: article.title, category: article.category, body: article.body ?? "" }
      : EMPTY
  );

  function set(key) {
    return (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={TITLES[mode]}
      width={678}
      showCloseButton
      footer={
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={() => onSave?.(mode, values)}
        >
          Publish
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Title"
          placeholder="Article title"
          value={values.title}
          onChange={set("title")}
        />

        <SelectField
          label="Category"
          options={ARTICLE_CATEGORIES}
          value={values.category}
          onChange={set("category")}
        />

        <Textarea
          label="Body (markdown)"
          rows={5}
          placeholder="Enter a description..."
          value={values.body}
          onChange={set("body")}
        />
      </div>
    </Modal>
  );
}
