import { CustomerSource } from "services/CustomerSource";
import { EventLogger } from "services/EventLogger";
import { PricingService } from "services/PricingService";
import { SupplyController } from "services/SupplyController";
import { VirtualCustomerDataSource } from "../CustomerDataSource/VirtualCustomerDataSource";
import { PastEvents, VirtualEventLogger } from "../EventLogger/VirtualEventLogger";
import { VirtualPricingService } from "../PricingService/VirtualPricingService";
import { VirtualSupplyController } from "../SupplyController/VirtualSupplyController";

export const VirtualInfraStructure = [
  { provide: SupplyController, useClass: VirtualSupplyController },
  { provide: EventLogger, useClass: VirtualEventLogger },
  { provide: PastEvents, useFactory: () => [] },
  { provide: PricingService, useClass: VirtualPricingService },
];