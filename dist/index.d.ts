import { JSX } from 'solid-js';

export declare function DirectoryNav(props: DirectoryNavProps): JSX.Element;

export declare interface DirectoryNavProps {
    tree: DirectoryTree;
    onLeafAction?: (actionDescription: string, node: Node_2) => void;
    initialNodeId?: string;
    onClose?: () => void;
    currentRecordDisplay?: string | null;
}

/**
 * Manages the directory tree structure.
 */
export declare class DirectoryTree {
    root: Node_2;
    private nodeMap;
    /**
     * Creates an instance of DirectoryTree.
     * @param rootName The name for the root directory.
     */
    constructor(rootName?: string);
    /**
     * Generates a simple unique ID.
     * @returns A random string ID.
     */
    private generateId;
    /**
     * Adds a new node (directory or leaf) to a specified parent node.
     * @param parentNode The parent Node object.
     * @param name The display name of the new node.
     * @param type The type of the new node (DIRECTORY or LEAF).
     * @param action Optional callback function if the node is a LEAF.
     * @returns The created Node, or null if creation failed.
     */
    addNodeToParent(parentNode: Node_2, name: string, type: NodeType, action?: () => void): Node_2 | null;
    /**
     * Convenience method to add a node using the parent's ID.
     * @param parentId The ID of the parent node.
     * @param name The display name of the new node.
     * @param type The type of the new node.
     * @param action Optional callback for LEAF nodes.
     * @returns The created Node, or null if parent not found or creation failed.
     */
    addNode(parentId: string, name: string, type: NodeType, action?: () => void): Node_2 | null;
    /**
     * Finds a node in the tree by its ID.
     * @param id The ID of the node to find.
     * @returns The Node if found, otherwise null.
     */
    findNode(id: string): Node_2 | null;
    /**
     * Retrieves the path from the root to the specified node as an array of node names.
     * Useful for breadcrumbs or displaying the current location.
     * @param nodeId The ID of the target node.
     * @returns An array of strings (node names) representing the path, or an empty array if node not found.
     */
    getNodePathNames(nodeId: string): string[];
}

/**
 * Represents a node in the directory tree.
 * It can be either a directory (containing other nodes) or a leaf (an action).
 */
declare class Node_2 implements NodeData {
    id: string;
    name: string;
    type: NodeType;
    parent: Node_2 | null;
    children?: Node_2[];
    action?: () => void;
    /**
     * Creates an instance of Node.
     * @param id A unique identifier for the node.
     * @param name The display name of the node.
     * @param type The type of the node (DIRECTORY or LEAF).
     * @param parent The parent node (null if root).
     * @param action The callback function if the node is a LEAF.
     */
    constructor(id: string, name: string, type: NodeType, parent?: Node_2 | null, action?: () => void);
}
export { Node_2 as Node }

/**
 * Interface defining the structure of a node's data.
 */
export declare interface NodeData {
    id: string;
    name: string;
    type: NodeType;
    children?: Node_2[];
    action?: () => void;
    parent?: Node_2 | null;
}

/**
 * Enum to define the type of a node in the directory.
 */
export declare enum NodeType {
    DIRECTORY = "DIRECTORY",
    LEAF = "LEAF"
}

export { }
