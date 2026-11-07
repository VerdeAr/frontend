import type {
	CreateReviewPayload,
	ReviewFormData,
} from "@/schemas/review.schema";
import type { Review } from "./models";

export interface FormattedReviewItem {
	id: string;
	rating: number;
	comment: string | null;
	created_at: string;
	customer: {
		id: string;
		name: string;
	};
}

export interface ProductRatingSummary {
	average_rating: number;
	review_count: number;
}

export type { CreateReviewPayload, Review, ReviewFormData };
