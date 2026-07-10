import { NavbarClient } from "@/components/landing/navbar-client";
import { getLogoHomeLink } from "@/lib/logo-home";

/** Server wrapper: resolves logo home from request host (docs/legal → marketing). */
export async function Navbar() {
  const logo = await getLogoHomeLink();

  return (
    <NavbarClient
      logoHref={logo.href}
      logoExternal={logo.external}
      logoSurfaceLabel={logo.surfaceLabel}
    />
  );
}
