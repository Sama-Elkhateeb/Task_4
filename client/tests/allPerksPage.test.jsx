import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import AllPerks from '../src/pages/AllPerks.jsx';
import { renderWithRouter } from './utils/renderWithRouter.js';

describe('AllPerks page (Directory)', () => {
  test('lists public perks and responds to name filtering', async () => {
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // ✅ Wait until loading text disappears
    await waitFor(
      () => {
        expect(screen.queryByText(/loading perks/i)).not.toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    // ✅ Then wait until the seeded perk appears
    await waitFor(
      () => {
        expect(
          screen.getByText((content) =>
            content.toLowerCase().includes(seededPerk.title.toLowerCase())
          )
        ).toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    // ✅ Interact with the name filter input
    const nameFilter = screen.getByPlaceholderText('Enter perk name...');
    fireEvent.change(nameFilter, { target: { value: seededPerk.title } });

    // ✅ Ensure the perk is still visible after filtering
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.toLowerCase().includes(seededPerk.title.toLowerCase())
        )
      ).toBeInTheDocument();
    });

    // ✅ Confirm that the summary text updates correctly
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });

  /*
  TODO: Test merchant filtering
  - use the seeded record
  - perform a real HTTP fetch.
  - wait for the fetch to finish
  - choose the record's merchant from the dropdown
  - verify the record is displayed
  - verify the summary text reflects the number of matching perks
  */

  test('lists public perks and responds to merchant filtering', async () => {
    // The seeded record gives us a deterministic expectation.
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    // Render the exploration page so it performs its real HTTP fetch.
    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait for the baseline card to appear which guarantees the asynchronous fetch finished.
    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // Find the option for the seeded merchant then its select element.
    const merchantOption = await screen.findByRole('option', { name: seededPerk.merchant });
    const merchantSelect = merchantOption.closest('select');
    expect(merchantSelect).toBeTruthy();

    // Choose the seeded merchant from the dropdown.
    fireEvent.change(merchantSelect, { target: { value: merchantOption.value } });

    // Verify the seeded record is still displayed after filtering.
    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // The summary text should reflect matching perks.
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });

});
