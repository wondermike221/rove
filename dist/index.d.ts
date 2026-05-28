export declare interface ActionItem {
    type: 'action';
    label: string;
    action: () => void;
}

export declare interface ComponentInstance {
    show(): void;
    hide(): void;
    toggle(): void;
    destroy(): void;
}

export declare interface ConsumerConfig {
    tree: DirectoryNode;
    keyPrefix: string;
    defaults?: ConsumerDefaults;
}

export declare interface ConsumerDefaults {
    mode?: 'palette' | 'dir';
    palettePin?: 'top' | 'middle' | 'bottom';
    globalShortcut?: string;
    modeSwapShortcut?: string;
    rememberLastMode?: boolean;
    theme?: 'light' | 'dark' | 'system';
}

export declare type DirectoryItem = DirectoryNodeItem | ActionItem | InputItem | VirtualItem;

export declare type DirectoryNode = Record<string, DirectoryItem>;

export declare interface DirectoryNodeItem {
    type: 'directory';
    label: string;
    children: DirectoryNode;
}

export declare function init(config: ConsumerConfig): ComponentInstance;

export declare interface InputItem {
    type: 'input';
    label: string;
    inputType: InputType;
    options?: string[];
    defaultValue?: string | boolean | string[];
    storageKey?: string;
    onChange?: (value: string | boolean | string[]) => void;
}

export declare type InputType = 'text' | 'textarea' | 'checkbox' | 'select' | 'select-multiple';

export declare interface VirtualItem {
    type: 'virtual';
    label: string;
    /**
     * persistent (default): loaded subtree is navigated into and cached in the
     * search index — user can return to it freely.
     *
     * ephemeral: loaded subtree is presented as a one-shot selection list.
     * After the user picks an item, onSelect fires and the nav returns to where
     * it was. The subtree is never added to the search index.
     */
    mode?: 'persistent' | 'ephemeral';
    load: () => Promise<DirectoryNode>;
    /** Called when an item is picked in ephemeral mode. */
    onSelect?: (key: string, item: DirectoryItem) => void;
}

export { }
