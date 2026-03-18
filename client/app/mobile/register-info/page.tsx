'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { mobileSaveUserInfo } from '@/server/mobile-auth';
import { useToast } from '@/components/ui/use-toast';

const steps = ['Personal Info', 'Academic Info', 'Review'];

const COLLEGE_DEPARTMENTS: Record<string, string[]> = {
  'College of Health Sciences': [
    'Bachelor of Science in Medical Technology (BSMedTech)',
    'Bachelor of Science in Nursing (BSN)',
  ],
  'International School of Hospitality & Tourism Management': [
    'Bachelor of Science in Hospitality Management (BSHM)',
    'Bachelor of Science in Tourism Management (BSTM)',
  ],
  'College of Teacher Education': [
    'Bachelor in Early Childhood Education (BECEd)',
    'Bachelor in Elementary Education (BSELEMEd)',
    'Bachelor in Secondary Education, Major in Information Technology (BSEd-IT)',
    'Bachelor in Secondary Education, Major in English (BSEd-Eng)',
    'Bachelor in Secondary Education, Major in Filipino (BSEd-Fil)',
    'Bachelor in Secondary Education, Major in Mathematics (BSEd-Math)',
    'Bachelor in Secondary Education, Major in Science (BSEd-Sci)',
    'Bachelor in Technical Vocational Teacher Education (BTVTEd), Major in Computer Programming',
    'Bachelor in Technical Vocational Teacher Education (BTVTEd), Major in Home Economics & Livelihood Education',
  ],
  'College of Engineering & Digital Technology': [
    'Bachelor of Science in Computer Engineering (BSCoE)',
    'Bachelor of Science in Electronics Engineering (BSElE)',
  ],
  'College of Arts & Sciences': [
    'Bachelor of Arts in Communication (ABComm / Masscom)',
    'Bachelor of Arts in English (AB English)',
    'Bachelor of Science in Mathematics (BSMath)',
    'Bachelor of Science in Psychology (BSP)',
  ],
  'College of Computer Studies': [
    'Associate in Computer Technology (ACT)',
    'Bachelor of Science in Computer Science (BSCS)',
    'Bachelor of Science in Information Technology (BSIT)',
    'Bachelor of Science in Information System (BSIS)',
  ],
  'College of Business & Accountancy': [
    'Associate in Business Administration',
    'Bachelor of Science in Accounting Information System (BSAIS)',
    'Bachelor of Science in Accountancy (BSA)',
    'Bachelor of Science in Management Accounting',
    'Bachelor of Science in Real Estate Management (BS REM)',
    'Bachelor of Science in Internal Auditing (BSIA)',
    'Bachelor of Science in Legal Management (BSLM)',
    'Bachelor of Science in Business Administration, Major in Financial Management (BSBA - FM)',
    'Bachelor of Science in Business Administration, Major in Operations Management (BSBA - OM)',
    'Bachelor of Science in Business Administration, Major in Human Resources Management (BSBA - HR)',
  ],
  'College of Criminology & Administration': [
    'Bachelor of Science in Criminology (BSCrim)',
    'Bachelor of Science in Industrial Security Management (BSISM)',
    'Bachelor in Public Administration (BPA)',
  ],
};

export default function MobileRegisterInfoPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNo: '',
    address: '',
    birthDate: '',
    studentNo: '',
    specialOrder: '',
    collegeDepartment: '',
    course: '',
  });
  const router = useRouter();
  const { toast } = useToast();

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canGoNext = () => {
    if (step === 0)
      return (
        form.firstName &&
        form.middleName &&
        form.lastName &&
        form.phoneNo &&
        form.address &&
        form.birthDate
      );
    if (step === 1)
      return (
        form.studentNo &&
        form.collegeDepartment &&
        form.course &&
        (form.specialOrder === 'YES' || form.specialOrder === 'NO')
      );
    return true;
  };

  const coursesForDepartment = form.collegeDepartment
    ? COLLEGE_DEPARTMENTS[form.collegeDepartment] ?? []
    : [];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await mobileSaveUserInfo(form);
      if (result?.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result?.success) {
        toast({ title: 'Success', description: 'Profile completed.' });
        router.push('/mobile/dashboard/home');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save info.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-br from-[#E900C4] to-[#007AEB] px-6 pt-12">
      <div className="mb-6">
        <p className="text-2xl text-white">Complete Profile</p>
        <p className="mt-1 text-sm text-white/80">Step {step + 1} of 3</p>
      </div>

      {/* Progress */}
      <div className="mb-6 flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold">{steps[step]}</h2>

        {step === 0 && (
          <div className="space-y-3">
            <Input placeholder="First Name *" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="h-11 rounded-lg bg-muted/50" required />
            <Input placeholder="Middle Name *" value={form.middleName} onChange={(e) => update('middleName', e.target.value)} className="h-11 rounded-lg bg-muted/50" required />
            <Input placeholder="Last Name *" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="h-11 rounded-lg bg-muted/50" required />
            <Input placeholder="Phone Number *" value={form.phoneNo} onChange={(e) => update('phoneNo', e.target.value)} className="h-11 rounded-lg bg-muted/50" required />
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Birth Date *</label>
              <Input type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} className="h-11 rounded-lg bg-muted/50" required max={new Date().toISOString().split('T')[0]} />
            </div>
            <Input placeholder="Address *" value={form.address} onChange={(e) => update('address', e.target.value)} className="h-11 rounded-lg bg-muted/50" required />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <Input placeholder="Student Number *" value={form.studentNo} onChange={(e) => update('studentNo', e.target.value)} className="h-11 rounded-lg bg-muted/50" required />
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">College Department *</label>
              <Select
                value={form.collegeDepartment}
                onValueChange={(val) => {
                  update('collegeDepartment', val);
                  update('course', '');
                }}
              >
                <SelectTrigger className="h-11 rounded-lg bg-muted/50">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(COLLEGE_DEPARTMENTS).map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Course *</label>
              <Select
                value={form.course}
                onValueChange={(val) => update('course', val)}
                disabled={!form.collegeDepartment}
              >
                <SelectTrigger className="h-11 rounded-lg bg-muted/50">
                  <SelectValue placeholder={form.collegeDepartment ? 'Select course' : 'Select department first'} />
                </SelectTrigger>
                <SelectContent>
                  {coursesForDepartment.map((courseName) => (
                    <SelectItem key={courseName} value={courseName}>
                      {courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Are you a graduate? *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => update('specialOrder', 'YES')}
                  className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    form.specialOrder === 'YES'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-muted/50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => update('specialOrder', 'NO')}
                  className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    form.specialOrder === 'NO'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-muted/50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-muted-foreground">Personal</h3>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p><span className="text-muted-foreground">Name:</span> {form.firstName} {form.middleName} {form.lastName}</p>
              <p><span className="text-muted-foreground">Phone:</span> {form.phoneNo}</p>
              <p><span className="text-muted-foreground">Birth Date:</span> {form.birthDate ? new Date(form.birthDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
              <p><span className="text-muted-foreground">Address:</span> {form.address}</p>
            </div>
            <h3 className="pt-2 font-semibold text-muted-foreground">Academic</h3>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p><span className="text-muted-foreground">Student No:</span> {form.studentNo}</p>
              <p><span className="text-muted-foreground">Department:</span> {form.collegeDepartment || '—'}</p>
              <p><span className="text-muted-foreground">Course:</span> {form.course || '—'}</p>
              <p><span className="text-muted-foreground">Graduate:</span> {form.specialOrder === 'YES' ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              className="h-12 flex-1 rounded-xl"
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="h-12 flex-1 rounded-xl"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
