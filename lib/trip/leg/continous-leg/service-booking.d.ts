import { TreeNode } from "../../../xml/tree-node";
export interface BookingArrangement {
    agencyCode: string;
    agencyName: string;
    infoURL: string;
}
export declare class ServiceBooking {
    bookingArrangements: BookingArrangement[];
    constructor(bookingArrangements: BookingArrangement[]);
    static initWithLegTreeNode(legTreeNode: TreeNode): ServiceBooking | null;
    private static computeAgencyName;
}
