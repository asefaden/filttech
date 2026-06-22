<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ExpertRatingController extends Controller
{
    public function rating()
    {
        $expert = User::find(Auth::id());

        // Calculate average rating (assuming you have this logic elsewhere)
        $rating = $expert->rating; // or however you calculate it

        // Total interactions for percentage calculation
        $totalInteractions = $expert->userExpertInteractions()->count();

        // Calculate percentage for each rating (1 to 5)
        $ratingPercentageByNumber = [];
        for ($i = 1; $i <= 5; $i++) {
            $count = $expert->userExpertInteractions()->where('rating', $i)->count();
            $percentage = $totalInteractions > 0 ? ($count / $totalInteractions) * 100 : 0;
            $ratingPercentageByNumber[$i] = round($percentage, 1); // optional: round for cleaner output
        }

        // Paginate the interactions with user data
        $usersWhoRated = $expert->userExpertInteractions()
            ->with('user')
            ->select('user_expert_interactions.*') // good practice when using with()
            ->latest() // optional: order by latest
            ->paginate(10);

        // Transform the paginated items
        $usersWhoRated->getCollection()->transform(function ($interaction) {
            return [
                'user_id'       => $interaction->user->id,
                'user_name'     => $interaction->user->name,
                'rating'        => $interaction->rating,
                'profile_image' => $interaction->user->profile_image,
                'ago'           => $interaction->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'message'                   => 'Expert Rating',
            'rating'                    => $rating,
            'rating_percentage_by_number' => $ratingPercentageByNumber,
            'users_who_rated'           => $usersWhoRated,
        ]);
    }
}
