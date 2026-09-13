import {
  InMemoryLegalJurisdictionRegistry,
} from "./jurisdictions";
import { loadLegalJurisdictions } from "./jurisdiction-loader";

export async function createLegalJurisdictionRegistry(): Promise<
  InMemoryLegalJurisdictionRegistry
> {
  const jurisdictions = await loadLegalJurisdictions();

  return new InMemoryLegalJurisdictionRegistry(jurisdictions);
}
