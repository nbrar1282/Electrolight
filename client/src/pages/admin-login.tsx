import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { AdminLogin } from "@shared/schema";

export default function AdminLogin() {
  const [formData, setFormData] = useState<AdminLogin>({
    username: "",
    password: "",
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLogin) => {
      const response = await apiRequest('POST', '/api/admin/login', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Login successful! Welcome to admin dashboard." });
      // Force a page reload to ensure fresh authentication state
      window.location.href = "/admin";
    },
    onError: () => {
      toast({ 
        title: "Login failed", 
        description: "Invalid username or password",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="ElectroLight Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ElectroLight</h1>
          <p className="text-gray-600">Admin Portal Access</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Admin Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login to Admin'}
              </Button>
            </form>
            
            {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
              <p className="text-sm text-blue-700">
                <strong>Username:</strong> admin<br />
                <strong>Password:</strong> admin123
              </p>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}