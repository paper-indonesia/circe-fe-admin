import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Building, Bell, Palette, Upload } from "lucide-react"

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your clinic settings and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Clinic Name</Label>
                <Input id="clinic-name" defaultValue="Beauty Clinic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+62 21 1234 5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="info@beautyclinic.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" defaultValue="Jl. Sudirman No. 123, Jakarta Pusat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Operating Hours</Label>
                <Input id="hours" defaultValue="Mon-Sat: 9:00 AM - 8:00 PM" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking Confirmations</Label>
                  <p className="text-sm text-muted-foreground">Send confirmation emails for new bookings</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Day Before Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send reminder 24 hours before appointment</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>3-Hour Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send reminder 3 hours before appointment</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>No-Show Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify when clients don't show up</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>No-Show Fee</Label>
                  <p className="text-sm text-muted-foreground">Charge fee for missed appointments</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no-show-fee">No-Show Fee Amount</Label>
                <Input id="no-show-fee" placeholder="Rp 100,000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation-policy"
                  placeholder="Enter your cancellation policy..."
                  defaultValue="Appointments must be cancelled at least 24 hours in advance to avoid charges."
                />
              </div>
              <Button>Update Policies</Button>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo Upload</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <p className="text-sm text-muted-foreground">Current theme: Feminine Pink & Lilac</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                  <div className="w-8 h-8 rounded-full bg-secondary border-2 border-white shadow-sm"></div>
                  <div className="w-8 h-8 rounded-full bg-accent border-2 border-white shadow-sm"></div>
                </div>
              </div>
              <Button variant="outline">Customize Theme</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
