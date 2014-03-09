class Nomination
  include Mongoid::Document

  field :url,     	 						type: String
  field :name,    							type: String
  field :rating,  							type: Float
  field :categories,  					type: Array
  field :restaurant_id,					type: String

  validates :restaurant_id, uniqueness: true

  embedded_in :huddle
end
