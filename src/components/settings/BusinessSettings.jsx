import { useState } from "react";
import Button from "../ui/Button.jsx";
import FileDropzone from "../ui/FileDropzone.jsx";
import TagInput from "../ui/TagInput.jsx";
import { TextField, SelectField, Textarea } from "../ui/TextField.jsx";
import {
  BUSINESS_PROFILE,
  BUSINESS_CATEGORIES,
  OPERATING_CITIES,
} from "../../data/settings.js";

/**
 * Settings > Business
 * Figma: GOLDEN / Settings (node 1181:87164)
 *
 * The logo field reuses `FileDropzone`, the large dashed drop zone Finance's
 * Proof field already uses - this frame draws the same control, so it is the
 * same component rather than a second upload treatment.
 *
 * Discard resets every field to the saved profile, which is what makes it
 * different from Cancel: there is no dialog to dismiss here.
 */
export default function BusinessSettings() {
  const [values, setValues] = useState(BUSINESS_PROFILE);
  const [cities, setCities] = useState(OPERATING_CITIES);
  const [logoFile, setLogoFile] = useState("");

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function discard() {
    setValues(BUSINESS_PROFILE);
    setCities(OPERATING_CITIES);
    setLogoFile("");
  }

  return (
    <section className="flex flex-col gap-5 rounded-md border border-border-default bg-surface p-5 shadow-sm">
      <TextField
        label="Business name"
        value={values.name}
        onChange={set("name")}
      />

      <FileDropzone
        label="Logo"
        fileName={logoFile}
        onChange={(file) => setLogoFile(file?.name ?? "")}
      />

      <div className="flex gap-6">
        <TextField
          label="GST number"
          className="flex-1"
          value={values.gstNumber}
          onChange={set("gstNumber")}
        />
        <SelectField
          label="Business category"
          className="flex-1"
          options={BUSINESS_CATEGORIES}
          value={values.category}
          onChange={set("category")}
        />
      </div>

      <Textarea
        label="Address"
        rows={3}
        value={values.address}
        onChange={set("address")}
      />

      <TagInput
        label="Operating cities"
        value={cities}
        onChange={setCities}
        placeholder="Add a city and press Enter"
      />

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={discard}>
          Discard
        </Button>
        <Button variant="primary">Save changes</Button>
      </div>
    </section>
  );
}
