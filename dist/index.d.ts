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
    load: () => Promise<DirectoryNode>;
}

export { }
