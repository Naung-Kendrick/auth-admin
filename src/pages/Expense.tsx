import { useState } from "react";
import {
  useGetAllExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "@/store/expense/expenseApi";
import { useGetAllCategoriesQuery } from "@/store/category/categoryApi";
import { ExpenseType } from "@/types/TCategory";
import type { TExpense, TGetAllExpensesReq } from "@/types/TExpense";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

// Shadcn UI Imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Expense() {
  // --- States ---
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [filters, setFilters] = useState<TGetAllExpensesReq>({
    page: 1,
    limit: limit
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<TExpense | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    description: "",
    remark: "",
    qty: 1,
    unit: "pcs",
    amount: 0,
    categoryId: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  // --- API Hooks ---
  const { data: catData } = useGetAllCategoriesQuery();
  const { data: expData, isLoading } = useGetAllExpensesQuery(filters);
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  // --- Handlers ---
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setFilters({ page: 1, limit: limit });
  };

  const handleEdit = (expense: TExpense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      remark: expense.remark || "",
      qty: expense.qty,
      unit: expense.unit || "pcs",
      amount: expense.amount,
      categoryId:
        typeof expense.categoryId === "string"
          ? expense.categoryId
          : expense.categoryId._id,
      date: expense.date.split("T")[0], // Format for input type="date"
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setEditingExpense(null);
    setFormData({
      description: "",
      remark: "",
      qty: 1,
      unit: "pcs",
      amount: 0,
      categoryId: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    } 
    if (formData.qty < 1 || formData.amount < 1) {
      toast.error("Invalid quantity or amount!");
      return;
    }

    try {
      if (editingExpense) {
        await updateExpense({ _id: editingExpense._id, ...formData }).unwrap();
        toast.success("Expense updated");
      } else {
        await createExpense(formData).unwrap();
        toast.success("Expense recorded");
      }
      closeDialog();
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Expenses
          </h1>
          <p className="text-slate-500 text-sm">
            Track your daily spending and earnings
          </p>
        </div>

<Dialog open={isOpen} onOpenChange={(val) => !val && closeDialog()}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 shadow-md"
            >
              <Plus size={18} /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-125 rounded-2xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingExpense ? "Update Expense" : "New Entry"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4 py-4"
            >
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Input
                  required
                  placeholder="Dinner, Salary, Rent..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, categoryId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {catData?.categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Amount (Unit Price)</Label>
                <Input
                  type="number"
                  value={formData.amount || undefined}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    className="w-20"
                    value={formData.qty || undefined}
                    onChange={(e) =>
                      setFormData({ ...formData, qty: Number(e.target.value) })
                    }
                  />
                  <Input
                    placeholder="pcs"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Remark (Optional)</Label>
                <Input
                  placeholder="Extra notes..."
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                />
              </div>

<div className="col-span-2 pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-indigo-600 rounded-xl px-8"
                >
                  Save Transaction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- Filter Bar --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 font-medium text-sm border-r pr-4">
          <Filter size={16} /> Filters:
        </div>

        <Select
          onValueChange={(val) =>
            setFilters({ ...filters, type: val as ExpenseType })
          }
        >
          <SelectTrigger className="w-35 border-none bg-slate-50">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
            >
              All Types
            </SelectItem>
            <SelectItem value={ExpenseType.INCOME}>Income</SelectItem>
            <SelectItem value={ExpenseType.OUTCOME}>Outcome</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(val) => setFilters({ ...filters, categoryId: val })}
        >
          <SelectTrigger className="w-45 border-none bg-slate-50">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {catData?.categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-slate-400 hover:text-indigo-600"
        >
          <X size={16} className="mr-1" /> Reset
        </Button>
      </div>

{/* --- Table Section --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-20 animate-pulse text-slate-400"
                >
                  Loading expenses...
                </TableCell>
              </TableRow>
            ) : expData?.expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-20 text-slate-400"
                >
                  No transactions recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              expData?.expenses.map((exp) => (
                <TableRow
                  key={exp._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(exp.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-700">
                      {exp.description}
                    </div>
                    {exp.remark && (
                      <div className="text-xs text-slate-400">{exp.remark}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-normal border-slate-200"
                    >
                      {typeof exp.categoryId === "object"
                        ? exp.categoryId.title
                        : "General"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 italic">
                    {exp.qty} {exp.unit}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${exp.type === ExpenseType.INCOME ? "text-emerald-600" : "text-slate-800"}`}
                  >
                    {exp.type === ExpenseType.INCOME ? "+" : ""}$
                    {exp.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                        onClick={() => handleEdit(exp)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        onClick={() => deleteExpense(exp._id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

<div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{expData?.expenses.length || 0}</span> transactions
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-1 px-3"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            
            <div className="flex items-center justify-center min-w-8 h-8 text-sm font-medium bg-white border border-slate-200 rounded-lg text-indigo-600 shadow-sm">
              {currentPage}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-1 px-3"
              disabled={!expData?.expenses || expData.expenses.length < limit || isLoading}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expense;