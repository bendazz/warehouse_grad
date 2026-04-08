const COLUMNS = ["id", "name", "sport", "category", "quantity", "price", "supplier", "last_restocked"];
const NUMERIC = new Set(["id", "quantity", "price"]);

async function loadInventory() {
  const tbody = document.querySelector("#inventory-table tbody");
  try {
    const res = await fetch("/inventory");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();

    tbody.innerHTML = "";
    for (const row of rows) {
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
      const btn = document.createElement("button");
      btn.textContent = "delete";
      btn.className = "delete-btn";
      btn.addEventListener("click", () => deleteItem(row.id, row.name));
      actionTd.appendChild(btn);
      tr.appendChild(actionTd);

      tbody.appendChild(tr);
    }

    document.getElementById("row-count").textContent = `${rows.length} row${rows.length === 1 ? "" : "s"}`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="${COLUMNS.length + 1}" class="null">Failed to load: ${err.message}</td></tr>`;
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

document.addEventListener("DOMContentLoaded", loadInventory);
