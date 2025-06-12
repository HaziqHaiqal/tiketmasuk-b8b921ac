
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, MapPin, Users, Clock, HelpCircle } from 'lucide-react';

interface Event {
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  venue: string;
  attendees: number;
  maxCapacity: number;
}

interface EventDetailsTabProps {
  event: Event;
}

const EventDetailsTab: React.FC<EventDetailsTabProps> = ({ event }) => {
  const faqs = [
    {
      question: "What time does the event start?",
      answer: `The event starts at ${event.time}. Gates open 1 hour before the start time.`
    },
    {
      question: "Is parking available?",
      answer: "Yes, parking is available on-site for RM15. We recommend arriving early as spaces are limited."
    },
    {
      question: "Can I bring my own food and drinks?",
      answer: "Outside food and beverages are not permitted. We have a variety of food vendors on-site."
    },
    {
      question: "What should I bring?",
      answer: "Bring a valid ID, your ticket (digital or printed), and comfortable shoes. Blankets and low-back chairs are welcome."
    },
    {
      question: "What is the refund policy?",
      answer: "Tickets are non-refundable except in case of event cancellation. However, you may transfer your ticket to someone else."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-gray-600">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {event.endDate && event.endDate !== event.date && (
                    <span> - {new Date(event.endDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  )}
                </p>
                <p className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {event.time}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="font-medium">Venue</p>
                <p className="text-gray-600">{event.venue}</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="font-medium">Attendance</p>
                <p className="text-gray-600">
                  {event.attendees} attending • {event.maxCapacity - event.attendees} spots left
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About This Event */}
      <Card>
        <CardHeader>
          <CardTitle>About This Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">{event.description}</p>
            <p className="text-gray-700">{event.fullDescription}</p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetailsTab;
