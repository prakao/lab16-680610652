import { useMemo, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";

const NEW_INSTRUCTOR_PREFIX = "__new__:";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } =
    useEnrollmentStore();

  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");
  const anchor = useComboboxAnchor();

  const allInstructors = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.instructors?.forEach((i) => set.add(i)));
    return Array.from(set).sort();
  }, [courses]);

  const instructorItems = useMemo(() => {
    const trimmed = instructorQuery.trim();
    const items = [...allInstructors];
    if (
      trimmed &&
      !allInstructors.some((i) => i.toLowerCase() === trimmed.toLowerCase()) &&
      !instructors.includes(trimmed)
    ) {
      items.push(`${NEW_INSTRUCTOR_PREFIX}${trimmed}`);
    }
    return items;
  }, [allInstructors, instructorQuery, instructors]);

  const isDuplicateCode = courses.some(
    (c) => c.courseCode.toLowerCase() === courseCode.trim().toLowerCase(),
  );

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setInstructors([]);
    setInstructorQuery("");
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) resetForm();
  };

  const handleSave = () => {
    if (!courseCode.trim() || !courseTitle.trim() || isDuplicateCode) return;
    addCourse({
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim(),
      instructors,
    });
    setOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
            ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4" />
            เพิ่มวิชา
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  aria-invalid={isDuplicateCode || undefined}
                  className={isDuplicateCode ? "border-destructive" : ""}
                />
                {isDuplicateCode && (
                  <p className="text-sm text-destructive">
                    มีรหัสวิชา {courseCode.trim().toUpperCase()} นี้แล้ว
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>ผู้สอน</Label>
                <Combobox
                  items={instructorItems}
                  multiple
                  value={instructors}
                  onValueChange={(v) => {
                    const resolved = (v as string[]).map((val) =>
                      val.startsWith(NEW_INSTRUCTOR_PREFIX)
                        ? val.slice(NEW_INSTRUCTOR_PREFIX.length)
                        : val,
                    );
                    setInstructors(resolved);
                    setInstructorQuery("");
                  }}
                  inputValue={instructorQuery}
                  onInputValueChange={setInstructorQuery}
                >
                  <ComboboxChips ref={anchor}>
                    <ComboboxValue>
                      {instructors.map((name) => (
                        <ComboboxChip key={name}>{name}</ComboboxChip>
                      ))}
                    </ComboboxValue>
                    <ComboboxChipsInput placeholder="พิมพ์ชื่อผู้สอน..." />
                  </ComboboxChips>
                  <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>ไม่พบผู้สอน</ComboboxEmpty>
                    <ComboboxList>
                      {(item: string) => (
                        <ComboboxItem key={item} value={item}>
                          {item.startsWith(NEW_INSTRUCTOR_PREFIX)
                            ? `+ เพิ่มผู้สอน "${item.slice(NEW_INSTRUCTOR_PREFIX.length)}"`
                            : item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={
                  !courseCode.trim() || !courseTitle.trim() || isDuplicateCode
                }
                onClick={handleSave}
              >
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="w-16">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.courseCode}>
                <TableCell className="font-medium">{c.courseCode}</TableCell>
                <TableCell>{c.courseTitle}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {!c.instructors || c.instructors.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    ) : (
                      c.instructors.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {name}
                          <button
                            type="button"
                            aria-label={`ลบผู้สอน ${name}`}
                            onClick={() => removeInstructor(c.courseCode, name)}
                            className="ml-0.5 rounded-full hover:opacity-70"
                          >
                            ×
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ลบวิชา {c.courseCode}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          การลงทะเบียนของนักศึกษาในวิชานี้ทั้งหมดจะถูกลบไปด้วย
                          และไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeCourse(c.courseCode)}
                        >
                          ลบวิชา
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
