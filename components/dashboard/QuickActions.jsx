import { Button } from "@/components/ui/button";
import { Plus, Bell, MapPin, Settings } from "lucide-react";

export default function QuickActions({
  onCheckOutages,
  onReportOutage,
  onAddLocation,
  onManageAlerts,
  onSettings,
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={onCheckOutages}
      >
        <MapPin className="w-4 h-4" />
        Check Outages
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={onReportOutage}
      >
        <Plus className="w-4 h-4" />
        Report Outage
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={onAddLocation}
      >
        <MapPin className="w-4 h-4" />
        Add Location
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={onManageAlerts}
      >
        <Bell className="w-4 h-4" />
        Manage Alerts
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={onSettings}
      >
        <Settings className="w-4 h-4" />
        Settings
      </Button>
    </div>
  );
}
