import { useState } from "react";
import { 
  useGetAllCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation 
} from "@/store/category/categoryApi";
import { ExpenseType, type TCategory } from "@/types/TCategory";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader } from "lucide-react";

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
  DialogFooter,
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

function Category() {
  const { data, isLoading } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TCategory | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: ExpenseType.OUTCOME,
  });

  // Handle Edit Click
  const handleEdit = (category: TCategory) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      description: category.description || "",
      type: category.type,
    });
    setIsOpen(true);
  };

  // Reset Form
  const closeDialog = () => {
    setIsOpen(false);
    setEditingCategory(null);
    setFormData({ title: "", description: "", type: ExpenseType.OUTCOME });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory({ _id: editingCategory._id, ...formData }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(formData).unwrap();
        toast.success("Category created");
      }
      closeDialog();
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
        toast.success("Category deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-slate-500 text-sm">Manage your income and expense labels</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => !val && closeDialog()}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2" onClick={() => setIsOpen(true)}>
              <Plus size={18} /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25 rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Category Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Food, Salary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Short note..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              {!editingCategory && (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val) => setFormData({ ...formData, type: val as ExpenseType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ExpenseType.INCOME}>Income</SelectItem>
                      <SelectItem value={ExpenseType.OUTCOME}>Outcome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={isCreating || isUpdating} className="bg-indigo-600">
                  {(isCreating || isUpdating) && (
                    <Loader />
                  )}
                  {editingCategory ? "Update Changes" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-75">Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Loading categories...</TableCell></TableRow>
            ) : data?.categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">No categories found.</TableCell></TableRow>
            ) : (
              data?.categories.map((category) => (
                <TableRow key={category._id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-700">{category.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      category.type === ExpenseType.INCOME 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }>
                      {category.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm truncate max-w-50">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600" onClick={() => handleEdit(category)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => handleDelete(category._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Category;