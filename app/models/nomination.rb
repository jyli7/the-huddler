class Nomination
  include Mongoid::Document

  field :url,     	 						type: String
  field :name,    							type: String
  field :rating,  							type: Float
  field :categories,  					type: Array
  field :restaurant_id,					type: String
  field :total_score,           type: Integer, default: 0

  validates :restaurant_id, uniqueness: true

  embedded_in :huddle

  def add_to_score!(score)
  	if score && score.is_a?(Integer)
  		self.total_score ||= 0
	  	self.total_score += score
	  	self.save!
	  end
  end
end
