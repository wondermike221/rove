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

export declare type DirectoryItem = DirectoryNodeItem | ActionItem | InputItem | SelectItem;

export declare type DirectoryNode = Record<string, DirectoryItem>;

export declare interface DirectoryNodeItem {
    type: 'directory';
    label: string;
    /**
     * Static children. Absent on a lazy directory before its first load.
     * After `load()` resolves, the library caches the result here so
     * subsequent activations navigate directly without re-loading.
     */
    children?: DirectoryNode;
    /**
     * Optional async loader. When present and `children` is absent, the node
     * acts as a lazy directory: the first activation triggers the load, the
     * result is cached into `children`, and the user is navigated in.
     * Subsequent activations behave like a normal static directory.
     */
    load?: () => Promise<DirectoryNode>;
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

/**
 * A one-shot selection widget. Presents a list of string options and fires
 * `onSelect` when the user picks one. Options can be static or async-loaded.
 *
 * In DirView: shown as an ephemeral navigation list — user picks, nav returns.
 * In palette: shown as an inline ephemeral pick list.
 */
export declare interface SelectItem {
    type: 'select';
    label: string;
    /** Static option list. Mutually exclusive with `load`. */
    options?: string[];
    /** Async option loader. Called every time the item is activated. */
    load?: () => Promise<string[]>;
    onSelect: (value: string) => void;
}

export { }
