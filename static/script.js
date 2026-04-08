const COLUMNS = ["id", "name", "sport", "category", "quantity", "price", "supplier"];
const NUMERIC = new Set(["id", "quantity", "price"]);
const EDITABLE = ["name", "sport", "category", "quantity", "price", "supplier"];

let currentRows = [];

async function loadInventory() {
  const tbody = document.querySelector("#inventory-table tbody");
  try {
    const res = await fetch("/inventory");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    currentRows = await res.json();
    renderRows();
    document.getElementById("row-count").textContent =
      `${currentRows.length} row${currentRows.length === 1 ? "" : "s"}`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="${COLUMNS.length + 1}" class="null">Failed to load: ${err.message}</td></tr>`;
  }
}

function renderRows(editingId = null) {
  const tbody = document.querySelector("#inventory-table tbody");
  tbody.innerHTML = "";
  for (const row of currentRows) {
    tbody.appendChild(row.id === editingId ? buildEditRow(row) : buildViewRow(row));
  }
}

function buildViewRow(row) {
  const tr = document.createElement("tr");
  for (const col of COLUMNS) {
    const td = document.createElement("td");
    const val = row[col];
    if (val === null || val === undefined) {
      td.textContent = "NULL";
      td.classList.add("null");
    } else {
      td.textContent = col === "price" ? Number(val).toFixed(2) : val;
    }
    if (NUMERIC.has(col)) td.classList.add("num");
    tr.appendChild(td);
  }

  const actionTd = document.createElement("td");
  actionTd.className = "actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "edit";
  editBtn.className = "edit-btn";
  editBtn.addEventListener("click", () => renderRows(row.id));
  actionTd.appendChild(editBtn);

  const delBtn = document.createElement("button");
  delBtn.textContent = "delete";
  delBtn.className = "delete-btn";
  delBtn.addEventListener("click", () => deleteItem(row.id, row.name));
  actionTd.appendChild(delBtn);

  tr.appendChild(actionTd);
  return tr;
}

function buildEditRow(row) {
  const tr = document.createElement("tr");
  tr.className = "editing";
  const inputs = {};

  for (const col of COLUMNS) {
    const td = document.createElement("td");
    if (col === "id") {
      td.textContent = row.id;
      td.classList.add("num");
    } else {
      const input = document.createElement("input");
      input.value = row[col] ?? "";
      if (col === "quantity") {
        input.type = "number";
        input.min = "0";
      } else if (col === "price") {
        input.type = "number";
        input.step = "0.01";
        input.min = "0";
      }
      input.className = "row-input";
      inputs[col] = input;
      td.appendChild(input);
    }
    tr.appendChild(td);
  }

  const actionTd = document.createElement("td");
  actionTd.className = "actions";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "save";
  saveBtn.className = "edit-btn";
  saveBtn.addEventListener("click", () => saveItem(row.id, inputs));
  actionTd.appendChild(saveBtn);

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "cancel";
  cancelBtn.className = "delete-btn";
  cancelBtn.addEventListener("click", () => renderRows(null));
  actionTd.appendChild(cancelBtn);

  tr.appendChild(actionTd);
  return tr;
}

async function saveItem(id, inputs) {
  const data = {};
  for (const col of EDITABLE) {
    data[col] = inputs[col].value;
  }
  data.quantity = parseInt(data.quantity, 10);
  data.price = parseFloat(data.price);
  if (!data.supplier) data.supplier = null;

  try {
    const res = await fetch(`/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadInventory();
  } catch (err) {
    alert(`Update failed: ${err.message}`);
  }
}

async function deleteItem(id, name) {
  if (!confirm(`Delete "${name}" (id=${id})?`)) return;
  try {
    const res = await fetch(`/inventory/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadInventory();
  } catch (err) {
    alert(`Delete failed: ${err.message}`);
  }
}

async function createItem(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  data.quantity = parseInt(data.quantity, 10);
  data.price = parseFloat(data.price);
  if (!data.supplier) delete data.supplier;

  try {
    const res = await fetch("/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.reset();
    await loadInventory();
  } catch (err) {
    alert(`Insert failed: ${err.message}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadInventory();
  document.getElementById("create-form").addEventListener("submit", createItem);
});
