import { TreeNode } from "../../xml/tree-node";

import { TripContinousLeg } from "./trip-continous-leg";
import { TripTimedLeg } from "./trip-timed-leg";

export class TripLegFactory {
  public static initWithTreeNode(treeNode: TreeNode): TripContinousLeg | TripTimedLeg | null {
    const legID_string = treeNode.findTextFromChildNamed('Id');
    if (legID_string === null) {
      return null;
    }
    const legID = parseInt(legID_string, 10);

    const transferLegTreeNode = treeNode.findChildNamed('TransferLeg');
    if (transferLegTreeNode) {
      const transferLeg = TripContinousLeg.initWithTreeNode(legID, transferLegTreeNode, 'TransferLeg');
      if (transferLeg) {
        return transferLeg;
      }
    }

    const timedLegTreeNode = treeNode.findChildNamed('TimedLeg');
    if (timedLegTreeNode) {
      const timedLeg = TripTimedLeg.initWithTreeNode(legID, timedLegTreeNode);
      if (timedLeg) {
        return timedLeg;
      }
    }

    const tripContinousLegTreeNode = treeNode.findChildNamed('ContinuousLeg');
    if (tripContinousLegTreeNode) {
      const tripContinousLeg = TripContinousLeg.initWithTreeNode(legID, tripContinousLegTreeNode, 'ContinousLeg');
      if (tripContinousLeg) {
        return tripContinousLeg;
      }
    }

    return null;
  }
}
