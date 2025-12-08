"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HelpCircle, MessageSquare, Mail, Phone, Send, CheckCircle, AlertCircle, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function HelpDeskPage() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  // Get user from localStorage instead of useAuth to avoid auth context dependency
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (e) {
        console.error('Failed to get user from localStorage:', e)
      }
    }
  }, [])

  const [supportForm, setSupportForm] = useState({
    category: "",
    subject: "",
    message: "",
    priority: "medium"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supportForm.category || !supportForm.subject || !supportForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)

      // Prepare user name
      const userName = user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : user?.name || 'Anonymous'

      // Send support ticket via email API
      const response = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: supportForm.category,
          subject: supportForm.subject,
          message: supportForm.message,
          priority: supportForm.priority,
          userName: userName,
          userEmail: user?.email || '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit support ticket')
      }

      toast({
        title: "Success",
        description: "Your support ticket has been submitted. We'll get back to you soon!"
      })

      // Reset form
      setSupportForm({
        category: "",
        subject: "",
        message: "",
        priority: "medium"
      })
    } catch (error) {
      console.error('Support ticket error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit support ticket. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Help Desk</h1>
        <p className="text-lg text-gray-600">Get assistance and support for your questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Help Cards */}
        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-green-600" />
              Email Support
            </CardTitle>
            <CardDescription>
              Send us an email for detailed inquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">support@reserva.com</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = 'mailto:support@reserva.com'}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-green-600" />
              WhatsApp Support
            </CardTitle>
            <CardDescription>
              Chat with us on WhatsApp for quick help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+62-813-179-3503</span>
              </div>
              <Button
                variant="outline"
                className="w-full bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                onClick={() => window.open('https://api.whatsapp.com/send?phone=628131793503&text=Halo%2C%20saya%20butuh%20bantuan%20terkait%20aplikasi%20Reserva', '_blank')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat via WhatsApp
              </Button>
       
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Ticket Form */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Submit Support Ticket
          </CardTitle>
          <CardDescription>
            Fill out the form below and our support team will get back to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info Display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="font-medium text-gray-900">{user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={supportForm.category}
                  onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing & Subscription</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="account">Account Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={supportForm.priority}
                  onValueChange={(value) => setSupportForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={supportForm.subject}
                onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {supportForm.subject.length}/200 characters
              </p>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                value={supportForm.message}
                onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Please provide detailed information about your issue or question..."
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">
                {supportForm.message.length}/1000 characters
              </p>
            </div>

            {/* Info Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <span className="font-medium">Response Time:</span> Our support team typically responds within 24 hours during business days.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setSupportForm({
                  category: "",
                  subject: "",
                  message: "",
                  priority: "medium"
                })}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Need Urgent Help Section */}
      <Card className="shadow-sm border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-full">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Need Urgent Help?</h3>
                <p className="text-sm text-gray-600">Chat with us on WhatsApp for immediate assistance</p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
              onClick={() => window.open('https://api.whatsapp.com/send?phone=628131793503&text=Halo%2C%20saya%20butuh%20bantuan%20terkait%20aplikasi%20Reserva', '_blank')}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat on WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-600" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">How do I add a new customer?</h4>
              <p className="text-sm text-gray-700">
                Navigate to the Customers page from the main menu and click the "Add Customer" button. Fill in the required information and save.
              </p>
            </div>

            <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">How do I create an appointment?</h4>
              <p className="text-sm text-gray-700">
                Go to the Calendar page and click on a time slot. Select the customer, service, and staff member, then confirm the booking.
              </p>
            </div>

            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">How do I manage my subscription?</h4>
              <p className="text-sm text-gray-700">
                Visit Settings and navigate to the Subscription & Billing section. You can view your current plan and upgrade or manage your subscription there.
              </p>
            </div>

            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">Can I export my data?</h4>
              <p className="text-sm text-gray-700">
                Yes, visit the Reports page where you can generate and download various reports including appointments, customers, and revenue data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300"
          onClick={() => window.open('https://api.whatsapp.com/send?phone=628131793503&text=Halo%2C%20saya%20butuh%20bantuan%20terkait%20aplikasi%20Reserva', '_blank')}
          title="Chat on WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
