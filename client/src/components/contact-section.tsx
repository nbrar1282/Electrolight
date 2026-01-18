import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertContactMessage } from "@shared/schema";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully! We'll get back to you soon." });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    },
    onError: () => {
      toast({ 
        title: "Failed to send message", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">Contact us for product inquiries or technical support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information & Map */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <MapPin className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Address</div>
                    <div className="text-gray-600">123 Industrial Blvd, City, State 12345</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Phone className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <div className="text-gray-600">(555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Mail className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">info@electrolight.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Clock className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Hours</div>
                    <div className="text-gray-600">Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <Card>
              <CardHeader>
                <CardTitle>Find Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5220.084432563068!2d-122.86963652309635!3d49.142822871372076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5485d9148d2038c1%3A0x6bb1b13af5fe6a52!2sElectrolight!5e0!3m2!1sen!2sca!4v1755380115686!5m2!1sen!2sca" 
                    width="100%" 
                    height="300" 
                    style={{border: 0}} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="ElectroLight Location"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
