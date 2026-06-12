import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* Cards Grid */}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Total Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="h-4 w-4 text-muted-foreground">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">$45,231.89</div>
              <p class="text-xs text-green-600 dark:text-green-400 font-medium">+20.1% from last month</p>
            </CardContent>
          </Card>

          {/* Subscriptions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="h-4 w-4 text-muted-foreground">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">+2,350</div>
              <p class="text-xs text-green-600 dark:text-green-400 font-medium">+180.1% from last month</p>
            </CardContent>
          </Card>

          {/* Sales Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="h-4 w-4 text-muted-foreground">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">+12,234</div>
              <p class="text-xs text-green-600 dark:text-green-400 font-medium">+19% from last month</p>
            </CardContent>
          </Card>

          {/* Active Now Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="h-4 w-4 text-muted-foreground">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">+573</div>
              <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">+201 since last hour</p>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-7">
          {/* Overview Chart Card */}
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>A visual comparison of system bandwidth usage.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center border-t border-dashed">
              <div class="text-center">
                <p class="text-muted-foreground text-sm">Interactive charts can be integrated here.</p>
                <div class="flex items-center justify-center gap-1.5 mt-4">
                  <div class="h-16 w-3 bg-primary/20 rounded-t"></div>
                  <div class="h-24 w-3 bg-primary/40 rounded-t"></div>
                  <div class="h-12 w-3 bg-primary/30 rounded-t"></div>
                  <div class="h-32 w-3 bg-primary rounded-t animate-pulse"></div>
                  <div class="h-20 w-3 bg-primary/50 rounded-t"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest notifications and user actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <span class="relative flex h-2 w-2 shrink-0 rounded-full bg-green-500"></span>
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none text-foreground">User "satnaing" signed in</p>
                    <p class="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="relative flex h-2 w-2 shrink-0 rounded-full bg-blue-500"></span>
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none text-foreground">Astro Server compiled successfully</p>
                    <p class="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="relative flex h-2 w-2 shrink-0 rounded-full bg-yellow-500"></span>
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none text-foreground">Database backup completed</p>
                    <p class="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>Real-time server load and database access logs.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed">
            <p class="text-muted-foreground text-sm">Analytics graphs and usage charts go here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
