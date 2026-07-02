import { Alert, Button, Group } from "@mantine/core";
import { AlertCircle } from "lucide-react";

export function YouTubePermissionAlert() {
  const handleReauth = () => {
    window.location.href = "/api/auth/google?force_consent=1";
  };

  return (
    <Alert
      icon={<AlertCircle size={18} />}
      color="yellow"
      title="YouTube access not granted"
      radius="md"
      withCloseButton
      mb="xl"
    >
      <Group justify="space-between" mt="xs" wrap="nowrap">
        <span>
          To enable video recommendations, re-login and check{" "}
          <b>"View your YouTube account"</b> when prompted.
        </span>
        <Button
          size="xs"
          color="yellow"
          variant="light"
          radius="md"
          onClick={handleReauth}
        >
          Fix Access
        </Button>
      </Group>
    </Alert>
  );
}
