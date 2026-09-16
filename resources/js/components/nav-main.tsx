import { Link } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { toUrl } from "@/lib/utils";
import type { NavGroup } from "@/types";

function isSubItemActive(
    targetHref: string,
    allHrefs: string[],
    currentPath: string,
): boolean {
    const normalize = (p: string) =>
        p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p;
    const target = normalize(targetHref);
    const current = normalize(currentPath);

    if (current === target) {
        return true;
    }

    if (current.startsWith(target + "/")) {
        const hasLongerMatchingSibling = allHrefs.some((h) => {
            const sibling = normalize(h);
            if (sibling === target || sibling.length <= target.length) {
                return false;
            }
            return current === sibling || current.startsWith(sibling + "/");
        });

        return !hasLongerMatchingSibling;
    }

    return false;
}

export function NavMain({ items = [] }: { items: NavGroup[] }) {
    const { currentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <>
            {items.map((group) => {
                if (group.items.length === 0) return null;

                return (
                    <SidebarGroup key={group.title} className="px-2 py-0">
                        {group.title && (
                            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        )}
                        <SidebarMenu>
                            {group.items.map((item) => {
                                const hasSubItems = Boolean(
                                    item.items && item.items.length > 0,
                                );

                                if (hasSubItems) {
                                    const subItemHrefs = (item.items ?? []).map(
                                        (sub) => toUrl(sub.href),
                                    );

                                    const isSubActive = (item.items ?? []).some(
                                        (sub) =>
                                            isSubItemActive(
                                                toUrl(sub.href),
                                                subItemHrefs,
                                                currentUrl,
                                            ),
                                    );

                                    return (
                                        <Collapsible
                                            key={item.title}
                                            asChild
                                            defaultOpen={isSubActive}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        tooltip={{
                                                            children:
                                                                item.title,
                                                        }}
                                                        isActive={isSubActive}
                                                    >
                                                        {item.icon && (
                                                            <item.icon />
                                                        )}
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items?.map(
                                                            (subItem) => {
                                                                const active =
                                                                    isSubItemActive(
                                                                        toUrl(
                                                                            subItem.href,
                                                                        ),
                                                                        subItemHrefs,
                                                                        currentUrl,
                                                                    );

                                                                return (
                                                                    <SidebarMenuSubItem
                                                                        key={
                                                                            subItem.title
                                                                        }
                                                                    >
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                            isActive={
                                                                                active
                                                                            }
                                                                        >
                                                                            <Link
                                                                                href={
                                                                                    subItem.href
                                                                                }
                                                                                onClick={
                                                                                    handleLinkClick
                                                                                }
                                                                            >
                                                                                <span>
                                                                                    {
                                                                                        subItem.title
                                                                                    }
                                                                                </span>
                                                                            </Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                );
                                                            },
                                                        )}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                }

                                const isParentActive = isCurrentOrParentUrl(
                                    item.href,
                                );

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isParentActive}
                                            tooltip={{ children: item.title }}
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={handleLinkClick}
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
