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
import { 
  Plus, Pencil, Trash2, Filter, X, 
  ChevronLeft, ChevronRight, Calendar, Package, Loader2 
} from "lucide-react";
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
    limit: limit,
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
    setFilters((prev) => ({ ...prev, page: newPage }));
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
      date: expense.date.split("T")[0],
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
    <div className="space-y-6 pb-10 px-2 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            Expenses
          </h1>
          <p className="text-slate-500 text-xs md:text-sm">
            Track your daily spending and earnings
          </p>
        </div>

        {/* --- Dialog Section (FIXED TRIGGER) --- */}
        <Dialog open={isOpen} onOpenChange={(val) => (!val ? closeDialog() : setIsOpen(true))}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 shadow-md">
              <Plus size={18} /> Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingExpense ? "Update Expense" : "New Entry"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <div className="sm:col-span-2 space-y-2">
                <Label>Description</Label>
                <Input
                  required
                  placeholder="Dinner, Salary, Rent..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                >
                  <SelectTrigger className="rounded-xl">
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
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Qty & Unit</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    className="w-20 rounded-xl"
                    value={formData.qty || ""}
                    onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })}
                  />
                  <Input
                    placeholder="pcs"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label>Remark (Optional)</Label>
                <Input
                  placeholder="Extra notes..."
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="button" variant="outline" onClick={closeDialog} className="flex-1 rounded-xl order-2 sm:order-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating || isUpdating} 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl order-1 sm:order-2"
                >
                  {(isCreating || isUpdating) ? <Loader2 className="animate-spin" size={18}/> : "Save Transaction"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 overflow-x-hidden">
        <div className="flex items-center gap-2 text-slate-500 font-medium text-xs md:text-sm border-r pr-4">
          <Filter size={14} /> Filters:
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Select onValueChange={(val) => setFilters({ ...filters, type: val as ExpenseType })}>
            <SelectTrigger className="h-9 w-32 bg-slate-50 border-none rounded-lg text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={ExpenseType.INCOME}>Income</SelectItem>
              <SelectItem value={ExpenseType.OUTCOME}>Outcome</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => setFilters({ ...filters, categoryId: val })}>
            <SelectTrigger className="h-9 w-37 bg-slate-50 border-none rounded-lg text-xs">
              <SelectValue placeholder="Categories" />
            </SelectTrigger>
            <SelectContent>
              {catData?.categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-400 hover:text-indigo-600 h-9 text-xs">
            <X size={14} className="mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* --- MOBILE VIEW (Card Layout) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {isLoading ? (
          <p className="text-center py-20 text-slate-400 animate-pulse">Loading...</p>
        ) : expData?.expenses.length === 0 ? (
          <p className="text-center py-20 text-slate-400">No transactions recorded.</p>
        ) : (
          expData?.expenses.map((exp) => (
            <div key={exp._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  <Calendar size={12} /> {format(new Date(exp.date), "MMM dd, yyyy")}
                </div>
                <Badge variant="outline" className="text-[10px] font-normal rounded-lg bg-slate-50 border-slate-200">
                  {typeof exp.categoryId === "object" ? exp.categoryId.title : "General"}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-base">{exp.description}</h3>
                {exp.remark && <p className="text-xs text-slate-400 italic mt-0.5">{exp.remark}</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-slate-500 text-xs">
                  <span className="flex items-center gap-1"><Package size={14} /> {exp.qty} {exp.unit}</span>
                </div>
                <div className={`text-lg font-black ${exp.type === ExpenseType.INCOME ? "text-emerald-600" : "text-slate-800"}`}>
                  {exp.type === ExpenseType.INCOME ? "+" : "-"}${exp.totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <Button variant="outline" className="flex-1 h-9 rounded-xl gap-2 text-slate-600 text-xs" onClick={() => handleEdit(exp)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant="outline" className="flex-1 h-9 rounded-xl gap-2 text-red-500 hover:bg-red-50 border-red-50 text-xs" onClick={() => deleteExpense(exp._id)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- DESKTOP VIEW (Table Layout) --- */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                <TableCell colSpan={6} className="text-center py-20 animate-pulse text-slate-400">Loading...</TableCell>
              </TableRow>
            ) : (
              expData?.expenses.map((exp) => (
                <TableRow key={exp._id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-slate-500 text-sm">{format(new Date(exp.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-700">{exp.description}</div>
                    {exp.remark && <div className="text-xs text-slate-400">{exp.remark}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-slate-200">
                      {typeof exp.categoryId === "object" ? exp.categoryId.title : "General"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 italic">{exp.qty} {exp.unit}</TableCell>
                  <TableCell className={`text-right font-bold ${exp.type === ExpenseType.INCOME ? "text-emerald-600" : "text-slate-800"}`}>
                    {exp.type === ExpenseType.INCOME ? "+" : ""}${exp.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => handleEdit(exp)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteExpense(exp._id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-slate-500 order-2 sm:order-1">
          Showing <span className="font-medium text-slate-700">{expData?.expenses.length || 0}</span> transactions
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
          <Button variant="outline" size="sm" className="rounded-xl flex-1 sm:flex-none" disabled={currentPage <= 1 || isLoading} onClick={() => handlePageChange(currentPage - 1)}>
            <ChevronLeft size={16} /> Prev
          </Button>
          <div className="min-w-10 h-9 flex items-center justify-center font-bold bg-indigo-600 text-white rounded-xl shadow-sm">
            {currentPage}
          </div>
          <Button variant="outline" size="sm" className="rounded-xl flex-1 sm:flex-none" disabled={!expData?.expenses || expData.expenses.length < limit || isLoading} onClick={() => handlePageChange(currentPage + 1)}>
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Expense;