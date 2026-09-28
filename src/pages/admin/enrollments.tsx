import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";
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
import { Badge } from "@/components/ui/badge";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudents, unenrollStudent } =
    useEnrollmentStore();

  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");
  const anchor = useComboboxAnchor();

  // const studentOptions: Option[] = students.map((s) => ({
  //   value: s.studentId,
  //   label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  // }));

  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  // วิชาที่นักศึกษาที่เลือกยังไม่ได้ลงทะเบียน
  // const availableCourseOptions = courseOptions.filter(
  //   (c) =>
  //     !enrollments.some(
  //       (e) => e.studentId === formStudents && e.courseId === c.value
  //     )
  // );

  const availableStudents = formCourse
    ? students.filter((s) => !s.enrolledCourses.includes(formCourse))
    : [];

  const handleEnroll = () => {
    if (!formStudents || !formCourse) return;
    enrollStudents(formCourse, formStudents);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const resetForm = () => {
    setFormCourse(null);
    setFormStudents([]);
  };

  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) resetForm();
  };

  const handleCourseChange = (v: string) => {
    setFormCourse(v);
    setFormStudents([]);
  };

  const rows = courses.filter((c) => {
    if (mode === "course")
      return filterCourse === "all" || c.courseCode === filterCourse;
    if (filterStudent === "all") return true;
    return students
      .find((s) => s.studentId === filterStudent)
      ?.enrolledCourses.includes(c.courseCode);
  });

  const enrolledStudentsOf = (courseCode: string) =>
    students.filter((s) => s.enrolledCourses.includes(courseCode));

  // const nameOf = (studentId: string) => {
  //   const s = students.find((x) => x.studentId === studentId);
  //   return s ? `${s.firstName} ${s.lastName}` : "-";
  // };
  // const titleOf = (courseId: string) =>
  //   courses.find((c) => c.courseCode === courseId)?.courseTitle ?? "-";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog
        open={enrollDialogOpen}
        onOpenChange={handleEnrollDialogOpenChange}
      >
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วจึงเลือกนักศึกษาที่จะลงทะเบียนวิชานั้น
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={handleCourseChange}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>นักศึกษา</Label>
              <Combobox
                items={availableStudents.map((s) => s.studentId)}
                multiple
                value={formStudents}
                onValueChange={(v) => setFormStudents(v as string[])}
                disabled={!formCourse}
              >
                <ComboboxChips ref={anchor}>
                  <ComboboxValue>
                    {formStudents.map((id) => {
                      const s = students.find((x) => x.studentId === id);
                      return (
                        <ComboboxChip key={id}>
                          {s ? `${s.firstName} ${s.lastName}` : id}
                        </ComboboxChip>
                      );
                    })}
                  </ComboboxValue>
                  <ComboboxChipsInput
                    placeholder={
                      formCourse ? "เลือกนักศึกษา..." : "เลือกวิชาก่อน"
                    }
                  />
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>ไม่พบนักศึกษา</ComboboxEmpty>
                  <ComboboxList>
                    {(id: string) => {
                      const s = students.find((x) => x.studentId === id)!;
                      return (
                        <ComboboxItem key={id} value={id}>
                          {s.studentId} — {s.firstName} {s.lastName}
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={!formCourse || formStudents.length === 0}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[
              { value: "all", label: "ทุกคน" },
              ...students.map((s) => ({
                value: s.studentId,
                label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
              })),
            ]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => {
              const enrolled = enrolledStudentsOf(c.courseCode);
              return (
                <TableRow key={c.courseCode}>
                  <TableCell className="font-medium">{c.courseCode}</TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell>{enrolled.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {enrolled.map((s) => (
                        <Badge
                          key={s.studentId}
                          variant="outline"
                          className="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {s.firstName} {s.lastName}
                          <button
                            type="button"
                            aria-label={`ลบ ${s.firstName} ออกจากวิชา`}
                            onClick={() =>
                              unenrollStudent(c.courseCode, s.studentId)
                            }
                            className="ml-0.5 rounded-full hover:opacity-70"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
