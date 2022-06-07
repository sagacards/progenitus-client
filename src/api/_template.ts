// Explanation of the module.

import { useQuery } from 'react-query';

////////////
// Types //
//////////

// ...
export interface SomeType {}

//////////////
// Mapping //
////////////

// Map something for use in this app.
function mapSomething(input: any): SomeType {
    return {};
}

///////////////
// Fetching //
/////////////

// Retrieve something.
function fetchSomething(input: string): Promise<SomeType[]> {
    return new Promise(resolve => resolve([]));
}

////////////
// Hooks //
//////////

// Hook to retrieve something.
export function useSomething(input: string) {
    const query = useQuery<SomeType[], string>(`something-${input}`, () =>
        fetchSomething(input)
    );
    return {
        something: query.data,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
}
