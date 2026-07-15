import { entrarComGoogle } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function GoogleButton() {
  return (
    <form action={entrarComGoogle} className="w-full max-w-xs">
      <Button type="submit" variant="outline" className="w-full font-semibold">
        Entrar com Google
      </Button>
    </form>
  );
}
