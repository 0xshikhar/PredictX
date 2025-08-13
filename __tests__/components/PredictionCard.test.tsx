import { render, screen, fireEvent } from '@testing-library/react';
import { PredictionCard } from '@/components/prediction/PredictionCard';
import { Market } from '@/lib/types/prediction';

const mockMarket: Market = {
  id: '1',
  title: 'Will Bitcoin reach $100k by end of 2024?',
  description: 'Bitcoin has been showing strong momentum.',
  category: 'Crypto',
  imageUrl: 'https://example.com/bitcoin.jpg',
  endDate: new Date('2024-12-31'),
  status: 'ACTIVE',
  totalVolume: 25000,
  totalBets: 156,
  chainId: 1116,
  yesOdds: 67,
  noOdds: 33,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PredictionCard', () => {
  it('renders market information correctly', () => {
    render(<PredictionCard market={mockMarket} />);

    expect(screen.getByText('Will Bitcoin reach $100k by end of 2024?')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin has been showing strong momentum.')).toBeInTheDocument();
    expect(screen.getByText('Crypto')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('$25.0K')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    render(<PredictionCard market={mockMarket} />);
    
    const statusBadge = screen.getByText('ACTIVE');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-primary/10', 'text-primary');
  });

  it('calls onBetYes when Bet YES button is clicked', () => {
    const onBetYes = jest.fn();
    render(<PredictionCard market={mockMarket} onBetYes={onBetYes} />);

    const betYesButton = screen.getByText('Bet YES');
    fireEvent.click(betYesButton);

    expect(onBetYes).toHaveBeenCalledTimes(1);
  });

  it('calls onBetNo when Bet NO button is clicked', () => {
    const onBetNo = jest.fn();
    render(<PredictionCard market={mockMarket} onBetNo={onBetNo} />);

    const betNoButton = screen.getByText('Bet NO');
    fireEvent.click(betNoButton);

    expect(onBetNo).toHaveBeenCalledTimes(1);
  });

  it('calls onAddToWatchlist when Add to Watchlist button is clicked', () => {
    const onAddToWatchlist = jest.fn();
    render(<PredictionCard market={mockMarket} onAddToWatchlist={onAddToWatchlist} />);

    const watchlistButton = screen.getByText('Add to Watchlist');
    fireEvent.click(watchlistButton);

    expect(onAddToWatchlist).toHaveBeenCalledTimes(1);
  });

  it('hides action buttons when showActions is false', () => {
    render(<PredictionCard market={mockMarket} showActions={false} />);

    expect(screen.queryByText('Bet YES')).not.toBeInTheDocument();
    expect(screen.queryByText('Bet NO')).not.toBeInTheDocument();
    expect(screen.queryByText('Add to Watchlist')).not.toBeInTheDocument();
  });

  it('renders compact variant correctly', () => {
    render(<PredictionCard market={mockMarket} variant="compact" />);

    // Compact variant should still show essential information
    expect(screen.getByText('Will Bitcoin reach $100k by end of 2024?')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
    
    // But may hide some details like description
    expect(screen.queryByText('Add to Watchlist')).not.toBeInTheDocument();
  });

  it('renders swipe variant with full height', () => {
    const { container } = render(<PredictionCard market={mockMarket} variant="swipe" />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('h-full');
  });

  it('formats time remaining correctly', () => {
    // Create a market that ends in 2 days
    const futureMarket = {
      ...mockMarket,
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    };

    render(<PredictionCard market={futureMarket} />);
    
    // Should show days and hours
    expect(screen.getByText(/\d+d \d+h/)).toBeInTheDocument();
  });

  it('shows "Ended" for past markets', () => {
    const pastMarket = {
      ...mockMarket,
      endDate: new Date('2020-01-01'),
    };

    render(<PredictionCard market={pastMarket} />);
    
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('formats large volumes correctly', () => {
    const highVolumeMarket = {
      ...mockMarket,
      totalVolume: 1500000, // 1.5M
    };

    render(<PredictionCard market={highVolumeMarket} />);
    
    expect(screen.getByText('$1.5M')).toBeInTheDocument();
  });
});