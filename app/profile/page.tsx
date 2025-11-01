"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ProfileSchema = z.object({
  name: z.string().min(1, "Required").max(200),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  phone: z.string().max(50).optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_postalCode: z.string().optional(),
  address_country: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  conditions: z.string().optional(),
  emergency_name: z.string().optional(),
  emergency_relation: z.string().optional(),
  emergency_phone: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_policyNumber: z.string().optional(),
  bloodType: z.enum(["A+","A-","B+","B-","AB+","AB-","O+","O-"]).optional(),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  notes: z.string().max(5000).optional(),
})

type ProfileForm = z.infer<typeof ProfileSchema>

export default function PatientProfilePage() {
  const form = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      dob: "",
      gender: undefined,
      phone: "",
      address_line1: "",
      address_line2: "",
      address_city: "",
      address_state: "",
      address_postalCode: "",
      address_country: "",
      allergies: "",
      medications: "",
      conditions: "",
      emergency_name: "",
      emergency_relation: "",
      emergency_phone: "",
      insurance_provider: "",
      insurance_policyNumber: "",
      bloodType: undefined,
      heightCm: "",
      weightKg: "",
      notes: "",
    },
  })

  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/patient/profile", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!data) return
        form.reset({
          name: data.name || "",
          dob: data.dob || "",
          gender: data.gender || undefined,
          phone: data.phone || "",
          address_line1: data.address?.line1 || "",
          address_line2: data.address?.line2 || "",
          address_city: data.address?.city || "",
          address_state: data.address?.state || "",
          address_postalCode: data.address?.postalCode || "",
          address_country: data.address?.country || "",
          allergies: (data.allergies || []).join(", "),
          medications: (data.medications || []).join(", "),
          conditions: (data.conditions || []).join(", "),
          emergency_name: data.emergencyContact?.name || "",
          emergency_relation: data.emergencyContact?.relation || "",
          emergency_phone: data.emergencyContact?.phone || "",
          insurance_provider: data.insurance?.provider || "",
          insurance_policyNumber: data.insurance?.policyNumber || "",
          bloodType: data.bloodType || undefined,
          heightCm: data.heightCm ? String(data.heightCm) : "",
          weightKg: data.weightKg ? String(data.weightKg) : "",
          notes: data.notes || "",
        })
      } catch {}
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (values: ProfileForm) => {
    try {
      const payload = {
        name: values.name,
        dob: values.dob || undefined,
        gender: values.gender || undefined,
        phone: values.phone || undefined,
        address: {
          line1: values.address_line1 || undefined,
          line2: values.address_line2 || undefined,
          city: values.address_city || undefined,
          state: values.address_state || undefined,
          postalCode: values.address_postalCode || undefined,
          country: values.address_country || undefined,
        },
        allergies: (values.allergies || "").split(",").map((s) => s.trim()).filter(Boolean),
        medications: (values.medications || "").split(",").map((s) => s.trim()).filter(Boolean),
        conditions: (values.conditions || "").split(",").map((s) => s.trim()).filter(Boolean),
        emergencyContact: {
          name: values.emergency_name || undefined,
          relation: values.emergency_relation || undefined,
          phone: values.emergency_phone || undefined,
        },
        insurance: {
          provider: values.insurance_provider || undefined,
          policyNumber: values.insurance_policyNumber || undefined,
        },
        bloodType: values.bloodType || undefined,
        heightCm: values.heightCm ? Number(values.heightCm) : undefined,
        weightKg: values.weightKg ? Number(values.weightKg) : undefined,
        notes: values.notes || "",
      }

      const res = await fetch("/api/patient/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Save failed")

      toast({ title: "Saved", description: "Your profile was updated." })
    } catch (e) {
      toast({ title: "Error", description: "Could not save profile.", variant: "destructive" as any })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your personal and medical details</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Patient Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="dob" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="gender" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="phone" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="address_line1" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="address_line2" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField name="address_city" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="address_state" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="address_postalCode" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField name="address_country" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField name="allergies" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="Peanuts, Penicillin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="medications" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medications (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="Metformin, Atorvastatin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="conditions" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="Hypertension" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="insurance_provider" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="insurance_policyNumber" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField name="bloodType" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(["A+","A-","B+","B-","AB+","AB-","O+","O-"] as const).map((bt) => (
                            <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="heightCm" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="weightKg" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField name="emergency_name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="emergency_relation" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="emergency_phone" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField name="notes" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-end">
                  <Button type="submit">Save Profile</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
