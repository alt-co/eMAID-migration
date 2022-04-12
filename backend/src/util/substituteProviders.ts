import { Provider } from "injection-js";
import traverse from "traverse";

export function substituteProviders(source: Provider[], substitutions: { provide: any, [key: string]: any }[]): Provider[] {
  const provides = substitutions.map(s => s.provide);
  traverse(source).forEach(function(node) {
    if (provides.includes(node?.provide)) {
      this.delete();
    }
  })
  return source.concat(substitutions);
}