<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subject;
use App\Models\Chapter;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::query();

        // Apply search filter
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Get all or filtered PDFs
        $subjects = $query->get();

        // Return paginated PDFs
        return response()->json($subjects);
    }

    public function getChapters(Request $request, $id)
    {
        $subject = Subject::find($id);
    
        if (!$subject) {
            return response()->json(['message' => 'Subject not found'], 404);
        }

        $chapters = Chapter::where('subject_id', $id)->get();

        return response()->json($chapters);
    }
}
