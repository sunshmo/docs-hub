'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

type Option = {
	value: string;
	label: string;
};

interface MultiSelectComboboxProps {
	options: Option[];
	selectedValues: string[];
	onSelect: (values: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	className?: string;
	showClearButton?: boolean;
}

export function MultiSelect({
	options,
	selectedValues = [],
	onSelect,
	placeholder = 'Select items...',
	searchPlaceholder = 'Search...',
	emptyText = 'No items found.',
	className,
	showClearButton = true,
}: MultiSelectComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [searchValue, setSearchValue] = React.useState('');

	const filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(searchValue.toLowerCase()),
	);

	const handleSelect = (currentValue: string) => {
		const newSelectedValues = selectedValues.includes(currentValue)
			? selectedValues.filter((value) => value !== currentValue)
			: [...selectedValues, currentValue];
		onSelect(newSelectedValues);
	};

	const handleClearAll = () => {
		onSelect([]);
		setSearchValue('');
	};

	const displayText = selectedValues.length
		? options
				.filter((option) => selectedValues.includes(option.value))
				.map((option) => option.label)
				.join(', ')
		: placeholder;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div className="relative">
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={cn(className)}
					>
						<div className="flex justify-between w-full">
							<span
								className={cn('truncate', {
									'text-gray-500': !selectedValues?.length,
								})}
							>
								{displayText}
							</span>
							<div className="flex items-center">
								{showClearButton && selectedValues.length > 0 && (
									<div
										className="w-4 h-4 rounded-md hover:bg-gray-500 hover:text-white"
										onClick={(e) => {
											e.stopPropagation();
											handleClearAll();
										}}
									>
										<X className="h-4 w-4 opacity-50 hover:opacity-100" />
									</div>
								)}
								<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
							</div>
						</div>
					</Button>
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={searchValue}
						onValueChange={setSearchValue}
					/>
					{selectedValues.length > 0 && (
						<div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
							<span>{selectedValues.length} selected</span>
							<Button
								variant="ghost"
								size="sm"
								className="h-auto px-2 py-1 text-xs"
								onClick={handleClearAll}
							>
								Clear all
							</Button>
						</div>
					)}
					<CommandEmpty>{emptyText}</CommandEmpty>
					<CommandGroup className="max-h-64 overflow-y-auto">
						{filteredOptions.map((option) => (
							<CommandItem
								key={option.value}
								value={option.value}
								onSelect={() => handleSelect(option.value)}
							>
								<Check
									className={cn(
										'mr-2 h-4 w-4',
										selectedValues.includes(option.value)
											? 'opacity-100'
											: 'opacity-0',
									)}
								/>
								{option.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
