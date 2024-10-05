export type SelectOptionT = {
  id: string;
  [key: string]: any;
};

export type SelectOptionList = SelectOptionT[];

export type CategorizedSelectOptions = { [key: string]: SelectOptionT[] };

export type SelectState = {
  value: SelectOptionList | [];
  selectOptions: SelectOptionList | [];
  isOpen: boolean;
  inputValue: string;
  page: number;
  focusedOptionId: string;
  focusedCategory: string;
};

export type SelectSorterFunction = (
  options: SelectOptionList | CategorizedSelectOptions
) => SelectOptionList | CategorizedSelectOptions;

export type SelectCategorizeFuntion = (
  options: SelectOptionList
) => CategorizedSelectOptions;

export type CustomSelectCategorizeFunction = (
  options: SelectOptionList
) => CategorizedSelectOptions;

export type SelectFetchFunction = (
  link: string,
  params?: { searchQuery?: string; page?: number; [key: string]: any }
) => { data: any[]; totalRecords?: number };
