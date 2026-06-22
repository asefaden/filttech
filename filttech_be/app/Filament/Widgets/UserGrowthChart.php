<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class UserGrowthChart extends ChartWidget
{
    protected ?string $heading = 'User Growth This Year';

    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $driver = config('database.default');  // mysql | pgsql | sqlite

        // SQL month format
        if ($driver === 'pgsql') {
            $monthSelect = "TO_CHAR(created_at, 'YYYY-MM')";
        } else {
            $monthSelect = "DATE_FORMAT(created_at, '%Y-%m')";
        }

        // Query database
        $rawData = User::select(
            DB::raw("$monthSelect AS month"),
            DB::raw("COUNT(*) AS total")
        )
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        // Generate all months for the year (Y-m format but labels will be names)
        $months = [];
        $labels = [];

        $start = Carbon::now()->startOfYear();

        for ($i = 0; $i < 12; $i++) {
            $date = $start->copy()->addMonths($i);

            $key = $date->format('Y-m');      // For database matching
            $label = $date->format('M');      // Month name: Jan, Feb, Mar, ...

            $months[$key] = 0;
            $labels[] = $label;
        }

        // Fill actual months
        foreach ($rawData as $month => $total) {
            $months[$month] = $total;
        }

        return [
            'datasets' => [
                [
                    'label' => 'User Growth',
                    'data' => array_values($months),
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
