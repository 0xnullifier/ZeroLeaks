import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, Eye, FileCheck, Tag } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Link } from "react-router";

export function FeaturedLeaks() {
  // Mock data for demonstration
  const featuredLeaks = [
    {
      id: "1",
      title: "Corporate Environmental Violations Exposed",
      category: "Environment",
      date: "2023-11-15",
      summary:
        "Internal documents revealing systematic environmental regulation violations by a major corporation.",
      tags: ["corporate", "environment"],
      views: 12453,
    },
    {
      id: "2",
      title: "Government Surveillance Program Documents",
      category: "Government",
      date: "2023-10-22",
      summary:
        "Classified documents detailing an undisclosed mass surveillance program targeting civilians.",
      tags: ["surveillance", "government"],
      views: 28764,
    },
    {
      id: "3",
      title: "Financial Fraud in Banking Sector",
      category: "Finance",
      date: "2023-09-30",
      summary:
        "Evidence of systematic fraud and market manipulation by major financial institutions.",
      tags: ["finance", "fraud"],
      views: 9821,
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {featuredLeaks.map((leak, index) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px", once: true }}
          transition={{ duration: 0.4, delay: 0.6 + index * 0.2 }}
        >
          <Card
            key={leak.id}
            className="group bg-gradient-to-b from-accent/20 to-background/40 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge className="mb-2 bg-primary/90 hover:bg-primary">
                  {leak.category}
                </Badge>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Eye className="h-4 w-4 mr-1" />
                  {leak.views.toLocaleString()}
                </div>
              </div>
              <CardTitle className="text-xl">
                <Link
                  to={`/leaks/${leak.id}`}
                  className="hover:text-primary/80 transition-colors"
                >
                  {leak.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{leak.summary}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {leak.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-border/40 text-muted-foreground bg-background/50 backdrop-blur-sm"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center text-muted-foreground/70 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <time dateTime={leak.date}>
                  {formatDateTime(new Date(leak.date).getTime())}
                </time>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/30 pt-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-primary">
                  <FileCheck className="h-4 w-4 mr-1" />
                  <span className="text-sm">Verified</span>
                </div>
                <Link
                  to={`/leaks/${leak.id}`}
                  className="text-muted-foreground hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
