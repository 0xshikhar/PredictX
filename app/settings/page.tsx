"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
    User,
    Bell,
    Palette,
    Shield,
    CreditCard,
    LogOut,
    HelpCircle,
} from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"
import type { LinkedAccountWithMetadata } from "@privy-io/react-auth"
import Link from "next/link"

export default function SettingsPage() {
    const { user, logout } = usePrivy()

    // Safely access user data with fallbacks
    const googleAccount = user?.linkedAccounts.find(
        (acc: LinkedAccountWithMetadata) => acc.type === "google_oauth"
    )
    const githubAccount = user?.linkedAccounts.find(
        (acc: LinkedAccountWithMetadata) => acc.type === "github_oauth"
    )

    const name =
        (googleAccount as any)?.name ||
        (githubAccount as any)?.name ||
        user?.wallet?.address ||
        "User"
    const email =
        (googleAccount as any)?.email || (githubAccount as any)?.email || ""
    const profilePictureUrl =
        (googleAccount as any)?.profile_picture_url ||
        (githubAccount as any)?.profile_picture_url

    const [userName, setUserName] = useState(name)
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
    })
    const [theme, setTheme] = useState("dark")

    const handleSave = (section: string) => {
        toast.success(`${section} settings have been saved.`)
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                <header className="flex items-center space-x-4">
                    <User className="w-8 h-8 text-purple-400" />
                    <div>
                        <h1 className="text-3xl font-normal tracking-tight">Settings</h1>
                        <p className="text-gray-400">
                            Manage your account settings and preferences.
                        </p>
                    </div>
                </header>

                {/* Profile Settings */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <User className="w-6 h-6 text-gray-400" />
                            <div>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>
                                    Update your personal information.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Avatar className="w-20 h-20">
                                <AvatarImage
                                    src={profilePictureUrl}
                                    alt={userName}
                                />
                                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Button variant="outline">Change Photo</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    className="bg-gray-800 border-gray-700"
                                    disabled
                                />
                            </div>
                        </div>
                        <Button onClick={() => handleSave("Profile")}>Save Changes</Button>
                    </CardContent>
                </Card>

                <Separator className="bg-gray-800" />

                {/* Notification Settings */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <Bell className="w-6 h-6 text-gray-400" />
                            <div>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>
                                    Choose how you want to be notified.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <Switch
                                id="email-notifications"
                                checked={notifications.email}
                                onCheckedChange={checked =>
                                    setNotifications(prev => ({ ...prev, email: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sms-notifications">SMS Notifications</Label>
                            <Switch
                                id="sms-notifications"
                                checked={notifications.sms}
                                onCheckedChange={checked =>
                                    setNotifications(prev => ({ ...prev, sms: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <Switch
                                id="push-notifications"
                                checked={notifications.push}
                                onCheckedChange={checked =>
                                    setNotifications(prev => ({ ...prev, push: checked }))
                                }
                            />
                        </div>
                        <Button onClick={() => handleSave("Notification")}>Save</Button>
                    </CardContent>
                </Card>

                <Separator className="bg-gray-800" />

                {/* Appearance Settings */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <Palette className="w-6 h-6 text-gray-400" />
                            <div>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>
                                    Customize the look and feel of the app.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => handleSave("Appearance")}>Apply</Button>
                    </CardContent>
                </Card>

                <Separator className="bg-gray-800" />

                {/* Security Settings */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <Shield className="w-6 h-6 text-gray-400" />
                            <div>
                                <CardTitle>Security & Privacy</CardTitle>
                                <CardDescription>
                                    Manage your security settings.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline">Change Password</Button>
                        <Button variant="outline">Enable 2-Factor Authentication</Button>
                        <Button variant="destructive" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </CardContent>
                </Card>
                <Separator className="bg-gray-800" />

                {/* Billing Information */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <CreditCard className="w-6 h-6 text-gray-400" />
                            <div>
                                <CardTitle>Billing</CardTitle>
                                <CardDescription>
                                    Manage your subscription and payment methods.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>You are on the <span className="text-purple-400 font-semibold">Pro Plan</span>.</p>
                        <Button>Manage Subscription</Button>
                    </CardContent>
                </Card>

                <Separator className="bg-gray-800" />

                {/* Help & Support */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <HelpCircle className="w-6 h-6 text-gray-400" />
                            <div>
                                <CardTitle>Help & Support</CardTitle>
                                <CardDescription>
                                    Find help and support resources.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/support">
                            <Button variant="outline">Contact Support</Button>
                        </Link>
                        <Link href="/support#faq">
                            <Button variant="outline">FAQs</Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
